import Chat from "../models/Chat.js";
import User from "../models/User.js";

//채팅방 생성
export const createRoom = async (req, res) => {
  const {
    body: { id, id2, itemid },
  } = req;
  const roomExists = await Chat.exists({ users: [id, id2], item: itemid });
  if (roomExists) {
    return res.sendStatus(200);
  }
  try {
    const chat = await Chat.create({
      item: itemid,
      users: [id, id2],
    });
    const user1 = await User.findById(id);
    user1.chat.push(chat);
    await user1.save();

    const user2 = await User.findById(id2);
    user2.chat.push(chat);
    await user2.save();
  } catch (e) {
    return res.sendStatus(405);
  }
  res.sendStatus(201);
};

//요청한 채팅방 정보 넘겨주기
export const getRooms = async (req, res) => {
  const {
    params: { id },
  } = req;
  const user = await User.findById(id).populate({
    path: "chat",
    populate: "item",
  });
  if (!user) {
    return res.sendStatus(404);
  }
  res.status(200).json({ user });
};

// 채팅방이 비었을떄 대화기록 db에 저장
export const saveMessages = async (id, chatLog) => {
  const chat = await Chat.findById(id);
  chatLog.forEach((log) => {
    chat.messages.push(log);
  });
  await chat.save();
};
