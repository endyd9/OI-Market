import Item from "../models/Item.js";
import User from "../models/User.js";
import bycrpt from "bcrypt";

//상품 검색
export const searchResult = async (req, res) => {
  //글 제목에 키워드가 포함된 상품들중 판매완료가 아닌것들 보내주기
  try {
    const keyword = new RegExp(
      `${decodeURIComponent(req.url.replace("/search/", ""))}`,
      "i"
    );
    const item = await Item.find({
      $or: [{ title: keyword }, { description: keyword }],
      status: false,
    }).sort({ createdAt: "desc" });
    res.status(200).json({ item });
  } catch {
    res.sendStatus(404);
  }
};

// 회원가입
export const join = async (req, res) => {
  const {
    body: { name, email, userId, pass, birth, phone },
  } = req;
  const userExists = await User.exists({ email });
  if (userExists) {
    return res.sendStatus(403);
  }
  try {
    await User.create({
      name,
      email,
      userId,
      pass,
      birth,
      phone,
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

// id중복 체크
export const idExists = async (req, res) => {
  const userId = req.body.id;
  const user = await User.findOne({ userId });

  if (user) {
    res.sendStatus(409);
  } else {
    res.sendStatus(200);
  }
};

// 로그인
export const login = async (req, res) => {
  const {
    body: { userId, pass },
  } = req;
  const user = await User.findOne({ userId });
  if (!user) {
    return res.sendStatus(403);
  }
  const ok = await bycrpt.compare(pass, user.pass);
  if (!ok) {
    return res.sendStatus(403);
  }
  res.status(200).json({ id: user._id, name: user.name });
};
