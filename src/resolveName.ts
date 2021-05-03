export default function resolveName(call: any, callback: any) {
  const nameArr = call.request.name.split("");
  let initials = nameArr.filter(function (char: any) {
    return /[A-Z]/.test(char);
  });

  callback(null, { message: initials.join("") });
}
