export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '24px 20px',
      textAlign: 'center',
    }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        CrackIt © 2026 &nbsp;·&nbsp; Question bank refreshed daily by Gemini AI &nbsp;·&nbsp; Built with Next.js + Turso
      </p>
    </footer>
  );
}
