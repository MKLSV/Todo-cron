import msgService from "../msg.service";

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // const { name = 'World' } = req.query
  const result = await msgService.sendMsg()
  // console.log()
  return res.json({
    message: `Hello ${result}!`,
  })
}