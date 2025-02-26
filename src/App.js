import { Amplify, Auth, API } from "aws-amplify";  // ✅ `Auth` と `API` は `aws-amplify` から直接インポート
import awsExports from "./aws-exports";
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure(awsExports);

async function login() {
  try {
    await Auth.federatedSignIn();  // ✅ 修正: `loginWith` → `federatedSignIn`
  } catch (error) {
    console.error("Login failed:", error);
  }
}

async function callApi() {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    const requestData = {
      headers: { Authorization: `Bearer ${token}` },
      body: { name: "Test User" },
    };

    const response = await API.post("myAPI", "/getUserData", requestData);
    console.log("API Response:", response);
  } catch (error) {
    console.error("API Error:", error);
  }
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Welcome, {user?.username ?? "Guest"}</h1>

          {/* ログインボタン */}
          <button onClick={login} style={{ margin: "10px", padding: "10px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px" }}>
            Login
          </button>

          {/* API呼び出しボタン */}
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
