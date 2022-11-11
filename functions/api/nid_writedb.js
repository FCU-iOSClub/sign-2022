export async function onRequestPost({ request }) {
  /*
    formData: {
      uid,
      accessToken,
    }
  */
  const reqBody = await request.formData()

  // get nid data from KV by session in cookie
  const cookie = (0, import_cookie.parse)(request.headers.get("Cookie") || "");
  const nid_data = await env.NID_SISSION.get(cookie["NID_SISSION"], { type: 'json' })
  // convert nid_data to firebase document
  const document = {
    fields: {
      id: {
        stringValue: nid_data.id,
      },
      name: {
        stringValue: nid_data.name,
      },
      classname: {
        stringValue: nid_data.classname,
      },
      unit_id: {
        stringValue: nid_data.unit_id,
      },
      unit_name: {
        stringValue: nid_data.unit_name,
      },
      dept_id: {
        stringValue: nid_data.dept_id,
      },
      dept_name: {
        stringValue: nid_data.dept_name,
      },
      Email: {
        stringValue: nid_data.Email,
      },
    },
  }

  // create firebase firestore post options
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + reqBody.get(accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify(document),
  }
  // send post to firebase, create user nid
  await fetch(
    'https://firestore.googleapis.com/v1/projects/singin-8db60/databases/(default)/documents/user-nid?documentId=' +
      reqBody.get(uid),
    options
  )

  // redirect user to root '/'
  const response = new Response('', { status: 303 })
  response.headers.append('Location', '/')
  response.headers.append('Set-Cookie', `NID_SISSION=`)
  return response
}
