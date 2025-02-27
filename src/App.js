import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from "aws-amplify/auth";
import { useState, useEffect } from "react";

// 各ユーザーグループに応じた画面コンポーネント
const AdminDashboard = () => <h2>管理者画面</h2>;
const DevDashboard = () => <h2>開発者画面</h2>;
const UserDashboard = () => <h2>一般ユーザー画面</h2>;

Amplify.configure({ ...awsExports, ssr: true });

// ✅ Cognito Hosted UI へリダイレクト関数（App 関数の外に記述）
async function redirectToCognito() {
  try {
    await signInWithRedirect({
      provider: "COGNITO", // 🔹 明示的に Cognito を指定
    });
  } catch (error) {
    console.error("Redirect to Cognito failed:", error);
  }
}

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.idToken) {
          console.error("ID Token is missing. Redirecting to Cognito.");
          return redirectToCognito();
        }

        const idToken = session.tokens.idToken;
        console.log("ID Token:", idToken);

        const groups = idToken.payload["cognito:groups"] || [];
        console.log("User Groups:", groups);

        const user = await getCurrentUser();
        console.log("Current User:", user);

        setUserInfo({ username: user.username, token: idToken });
        setUserGroups(groups);
      } catch (error) {
        console.log("User not authenticated. Redirecting to Cognito.", error);
        redirectToCognito();
      }
    }

    fetchUserInfo();
  }, []);

  function renderDashboard() {
    if (userGroups.includes("Proto-Admin-Group")) {
      return <AdminDashboard />;
    } else if (userGroups.includes("Proto-Dev-Group")) {
      return <DevDashboard />;
    } else if (userGroups.includes("Proto-User-Group")) {
      return <UserDashboard />;
    } else {
      return <h2>アクセス権がありません</h2>;
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>ようこそ, {userInfo?.username ?? "ゲスト"} さん</h1>
      {renderDashboard()}

      <button onClick={() => signOut()} style={{ margin: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
        サインアウト
      </button>
    </div>
  );
}
