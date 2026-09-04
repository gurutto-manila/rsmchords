import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import LoginPage from './LoginPage';

interface AcceptBandInviteResponse {
  band?: {
    id?: string;
    name?: string;
  };
  error?: string;
}

export default function BandInvitePage() {
  useDocumentTitle('Band invitation');

  const { token: routeToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading, authEnabled } = useAuth();

  const token =
    routeToken?.trim() ||
    searchParams.get('bandInvite')?.trim() ||
    '';

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Authentication is intentionally handled here instead of redirecting to "/".
  // LoginPage preserves the current deep link, so after successful login the
  // user returns to this exact band invitation.
  if (loading) {
    return <div className="app-status">Loading invitation…</div>;
  }

  if (authEnabled && !user) {
    return <LoginPage />;
  }

  if (!token) {
    return (
      <div
        className="app-status"
        role="alert"
        style={{
          maxWidth: '560px',
          margin: '10vh auto',
          textAlign: 'left',
        }}
      >
        <h1>Invalid invitation</h1>

        <p>
          This band invitation link is missing its invitation token.
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/profile', { replace: true })}
        >
          Go to profile
        </button>
      </div>
    );
  }

  async function acceptInvitation() {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const response = await fetch(
        `/api/bands/invites/${encodeURIComponent(token)}/accept`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'same-origin',
        },
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as AcceptBandInviteResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to accept invitation (${response.status}).`,
        );
      }

      const bandId = data.band?.id;

      if (!bandId) {
        throw new Error(
          'Invitation was accepted, but the band information was not returned.',
        );
      }

      // Make the newly joined band the active band.
      try {
        window.localStorage.setItem('gigboy-active-band-id', bandId);
      } catch {
        // localStorage is optional; navigation still works without it.
      }

      navigate(`/bands/${bandId}/library`, {
        replace: true,
        state: {
          bandId,
          acceptedBandInvite: true,
          from: `${location.pathname}${location.search}`,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to accept invitation.',
      );

      setBusy(false);
    }
  }

  return (
    <div
      className="app-status"
      style={{
        maxWidth: '560px',
        margin: '10vh auto',
        textAlign: 'left',
      }}
    >
      <h1 style={{ marginBottom: '0.75rem' }}>
        RSM Music Ministry invitation
      </h1>

      <p>
        You have been invited to join a band in RSMChords.
      </p>

      <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
        Accept the invitation to access the band's songs, setlists,
        rehearsals, and other ministry resources.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={acceptInvitation}
          disabled={busy}
        >
          {busy ? 'Accepting…' : 'Accept invitation'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/profile')}
          disabled={busy}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
