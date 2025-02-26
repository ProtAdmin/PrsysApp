import { Amplify, API } from "aws-amplify"; // ✅ `API` を `aws-amplify` から直接インポート
import awsExports from "./aws-exports"; // AWSの設定
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";  // ✅ トークン取得用

Amplify.configure(awsExports);

function App() {
  const callApi = async () => {
    try {
      // ✅ 認証セッションを取得し、トークンを安全に取得
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() ?? "";  

      const requestData = {
        headers: { Authorization: `Bearer ${token}` },  // ✅ `Bearer` を追加
        body: { name: "Test User" },  // ✅ 直接 JSON を渡す
      };

      // ✅ `post` ではなく `API.post` を使用
      const response = await API.post("myAPI", "/getUserData", requestData);
      console.log("API Response:", response);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Welcome, {user?.signInDetails?.username ?? "Guest"}</h1>  {/* ✅ `username` の取得方法を修正 */}

          {/* APIを呼び出すボタン */}
          <button onClick={callApi} style={{ margin: "10px", padding: "10px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px" }}>
            Call API
          </button>

          {/* ログアウトボタン */}
          <button onClick={signOut} style={{ margin: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
            Sign out
          </button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
