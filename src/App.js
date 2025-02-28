import awsExports from "./aws-exports";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signInWithRedirect, signOut } from "aws-amplify/auth";
import { useState, useEffect } from "react";
import { exchangeCodeForToken } from "./auth"; // ✅ `auth.js` から `id_token` 取得関数をインポート

// 各ユーザーグループに応じた画面コンポーネント
const AdminDashboard = () => <h2>管理者画面</h2>;
const DevDashboard = () => <h2>開発者画面</h2>;
const UserDashboard = () => <h2>一般ユーザー画面</h2>;

Amplify.configure({ ...awsExports, ssr: true });

// ✅ Cognito Hosted UI へリダイレクト
async function redirectToCognito() {
  try {
    console.log("🔄 Redirecting to Cognito...");
    await signInWithRedirect({ provider: "COGNITO" });
  } catch (error) {
    console.error("❌ Redirect to Cognito failed:", error);
  }
}

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ユーザー情報取得
  async function fetchUserInfo() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      let idTokenValue;
      if (code) {
        console.log("🔄 Exchanging code for token...");
        idTokenValue = await exchangeCodeForToken(code);
        if (!idTokenValue) throw new Error("❌ Failed to retrieve ID token");

        // URL から `code` を削除
        window.history.replaceState({}, document.title, "/");
      } else {
        const user = await getCurrentUser();
        idTokenValue = user.signInUserSession.idToken.jwtToken; // ✅ `id_token` 取得
      }

      console.log("✅ ID Token:", idTokenValue);

      // ✅ `cognito:groups` を取得
      const userGroups = idTokenValue.payload["cognito:groups"] || [];
      console.log("✅ User Groups:", userGroups);

      setUserInfo({ username: user.username, token: idTokenValue, groups: userGroups });
    } catch (error) {
      console.error("❌ User not authenticated. Redirecting to Cognito.", error);
      redirectToCognito();
    } finally {
      setLoading(false);
    }
  }

  // ✅ `useEffect` で `fetchUserInfo()` を呼び出す
  useEffect(() => {
    fetchUserInfo();
  }, []);

  function renderDashboard() {
    console.log("🟡 Checking user groups for dashboard rendering:", userInfo?.groups);
    if (userInfo?.groups?.includes("Proto-Admin-Group")) {
      return <AdminDashboard />;
    } else if (userInfo?.groups?.includes("Proto-Dev-Group")) {
      return <DevDashboard />;
    } else if (userInfo?.groups?.includes("Proto-User-Group")) {
      return <UserDashboard />;
    } else {
      return <h2>🚫 アクセス権がありません</h2>;
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      console.log("✅ User signed out successfully.");
    } catch (error) {
      console.error("❌ Sign out failed:", error);
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {loading ? (
        <h2>🔄 認証情報を確認中...</h2>
      ) : (
        <>
          <h1>ようこそ, {userInfo?.username ?? "ゲスト"} さん</h1>
          {renderDashboard()}

          <button
            onClick={handleSignOut}
            style={{ margin: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}
          >
            サインアウト
          </button>
        </>
      )}
    </div>
  );
}
