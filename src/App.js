import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports"; // AWSの設定
import { Authenticator } from "@aws-amplify/ui-react";
import { API, Auth } from "aws-amplify";

Amplify.configure(awsExports);

function App() {
  const [name, setName] = useState(""); // 入力フィールド用のstate
  const [responseData, setResponseData] = useState(null); // APIのレスポンスを表示するstate

  const callApi = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();

      const requestData = {
        headers: { Authorization: token },
        body: JSON.stringify({
          userId: user.attributes.sub,
          name: name,
        }),
      };

      const response = await API.post("myAPI", "/getUserData", requestData);
      console.log("API Response:", response);
      setResponseData(response); // レスポンスを画面に表示
    } catch (error) {
      console.error("API Error:", error);
      setResponseData({ error: "API call failed." });
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Welcome, {user.username}</h1>

          {/* 名前入力フィールド */}
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          />

          {/* APIを呼び出すボタン */}
          <button onClick={callApi} style={{ padding: "10px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px" }}>
            Send to API
          </button>

          {/* ログアウトボタン */}
          <button onClick={signOut} style={{ padding: "10px", marginLeft: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
            Sign out
          </button>

          {/* APIのレスポンス表示 */}
          {responseData && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid black" }}>
              <h3>API Response:</h3>
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;
