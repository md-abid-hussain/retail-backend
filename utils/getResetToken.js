const crypto = require("crypto");
const prisma = require("../prisma/prisma");

const getResetToken = async (user) => {
  const resetToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: Date.now() + 15 * 60 * 1000,
    },
  });

  return resetToken;
};

module.exports =  getResetToken ;
