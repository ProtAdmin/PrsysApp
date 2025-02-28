export async function exchangeCodeForToken(code) {
    const clientId = "128mcrh4ftsd1onp7q9vomaolp"; // Cognito クライアント ID
    const redirectUri = "https://d1xj20n18wdq9y.cloudfront.net/index.html";
    const region = "ap-northeast-1";
    const tokenEndpoint = `https://ap-northeast-1.auth.${region}.amazoncognito.com/oauth2/token`;
  
    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
    });
  
    try {
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });
  
      if (!response.ok) {
        throw new Error("Failed to exchange code for token");
      }
  
      const data = await response.json();
      return data.id_token;
    } catch (error) {
      console.error("❌ Token exchange failed:", error);
      return null;
    }
  }
  