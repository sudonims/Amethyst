/**
 *
 * @param {username and uid} reqBody
 * @returns 6 digit lucky num
 */

module.exports = (reqBody) => {
  var { username, password } = reqBody;

  var num = 0,
    num1 = 1;

  for (let i in username) {
    num += i.charCodeAt(0);
  }

  for (let i in password) {
    num1 *= i.charCodeAt(0);
  }

  var lucky = parseInt(`${num1 / num}`);

  lucky *= 98765;
  lucky %= parseInt(num1);

  return lucky;
};
