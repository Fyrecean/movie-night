import { ensureDataDirectory, getCurrentWeekNumber, readWeekData, writeWeekData } from "@/lib/filing";
import { parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

const toggleVotes = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const cookie = parse(req.headers.cookie || '');
    const phoneNumber = cookie['movie-night-session'];
    if (phoneNumber !== "1234567890") {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    ensureDataDirectory();
    const weekNumber = getCurrentWeekNumber();
    let weekData = await readWeekData(weekNumber, true) || { weekNumber, allowVotes: false, users: [] };

    weekData.allowVotes = !weekData.allowVotes;
   
    const success = await writeWeekData(weekNumber, weekData);
    if (success) {
        res.status(200).json({ message: 'Saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save' });
    }
}

export default toggleVotes;