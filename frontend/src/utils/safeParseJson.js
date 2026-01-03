export default async function safeParseJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}
