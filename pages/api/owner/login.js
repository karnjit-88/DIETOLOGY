export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  if (
    email === process.env.OWNER_EMAIL &&
    password === process.env.OWNER_PASSWORD
  ) {
    res.setHeader('Set-Cookie', `dietology_owner=1; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 8}`)
    return res.status(200).json({ ok: true })
  }
  return res.status(401).json({ error: 'Invalid credentials' })
}
