import User from "../models/User.js";
import bcrypt from "bcrypt";

//유저 마이페이지 정보 넘겨주기
export const userPageData = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const user = await User.findById(id).populate("item");
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.sendStatus(404);
  }
};

// 유저 정보수정 정보 넘겨주기
export const getUserEdit = async (req, res) => {
  const {
    params: { id },
  } = req;
  const user = await User.findById(id);
  const { name, email, userId, birth, phone } = user;
  res.status(200).json({ user: { name, email, userId, birth, phone } });
};

// 변경된 유저 정보 저장
export const postUserEdit = async (req, res) => {
  const {
    body: { name, phone },
    params: { id },
  } = req;
  const user = await User.findById(id);
  user.name = name;
  user.phone = phone;
  await user.save();
  res.sendStatus(201);
};

// 변경할 비밀번호 체크
export const PwdCheck = async (req, res) => {
  const {
    body: { pwd, cpwd1, cpwd2 },
    params: { id },
  } = req;

  const user = await User.findById(id);
  const compere = await bcrypt.compare(pwd, user.pass);
  if (!compere) {
    return res.sendStatus(403);
  }
  if (cpwd1 !== cpwd2) {
    return res.sendStatus(200);
  }
  user.pass = cpwd1;
  await user.save();
  res.sendStatus(201);
};
