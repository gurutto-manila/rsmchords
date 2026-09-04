interface BrandMarkProps {
  size: number;
  scale?: number;
}

export default function BrandMark({ size, scale = 1.1 }: BrandMarkProps) {
  const scaledSize = size * scale;

  return (
    <span className="brand-name" style={{ fontSize: scaledSize }} aria-label="RSMChords">
      <span className="brand-name-rsm">RSM</span><span className="brand-name-chords">Chords</span>
    </span>
  );
}
