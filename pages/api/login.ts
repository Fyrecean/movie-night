// pages/api/login.ts

import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { isUserRSVPed, isValidPhoneNumber } from '@/lib/filing';

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const { phoneNumber } = req.body;
  const [valid, name] = isValidPhoneNumber(phoneNumber);

  if (!valid) {
    return res.status(400).json({ error: `Invalid phone number or user not found: ${phoneNumber}` });
  }

  // Adjust the cookie settings
  const serialized = serialize('movie-night-session', phoneNumber, {
    httpOnly: false, // Make the cookie accessible to client-side JavaScript
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 7 * 6, // 8 week
    path: '/',
  });

  res.setHeader('Set-Cookie', serialized);
  const body = { name: name, isRsvped: await isUserRSVPed(phoneNumber)};
  res.status(200).json(body);
};

export default login;
