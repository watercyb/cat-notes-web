import { getMailCount } from "../mails/mailtrap.js";
import Note from "../models/note.model.js";
import User from "../models/user_model.js";

export const analytics = async (req, res) => {
  try {
    const token = req.query.token;
    if (token !== process.env.ANALYTICS_TOKEN)
      return res.status(200).send({ success: true });

    const users = await User.countDocuments();
    const notes = await Note.countDocuments();
    const mails = getMailCount();

    res.status(200).json({
      success: true,
      users,
      notes,
      mails,
    });
  } catch (error) {
    console.log("Error in analytics: ", error.message);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};
