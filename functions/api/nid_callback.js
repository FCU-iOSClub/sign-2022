export async function onRequestPost({ request }) {
  const get_user_data_url = "https://opendata.fcu.edu.tw/fcuapi/api/GetUserInfo?client_id=638037929185.f4b4a8ed044a488c85074c7f9e5ada47.sign.iosclub.tw&user_code="
  const body = await request.text()
  console.log(body)
  const parms = body.split('&')
  if (parms[0].split('=')[1] !== '200') {
    return new Response('UnAuth', { status: 401 })
  }
  const userData = await fetch(get_user_data_url + parms[2].split('=')[1])
  const userInfo = (await userData.json()).UserInfo[0]
  const uuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
  await env.NID_SISSION.put(uuid, JSON.stringify(userInfo))
  const response = new Response('', { status: 303 })
  response.headers.append('Location', '/api/nid_writedb')
  response.headers.append('Set-Cookie', `NID_SISSION=${uuid}`)
  return response
}
