import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, redirect_uri } = req.body;

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: "Missing code or redirect_uri" });
  }

  const appId = process.env.VITE_META_APP_ID || "3486992541476144";
  const appSecret = process.env.VITE_META_APP_SECRET;

  if (!appSecret) {
    return res.status(500).json({ error: "Instagram app secret not configured" });
  }

  try {
    // Step 1: Exchange code for short-lived token
    const tokenUrl = "https://api.instagram.com/oauth/access_token";
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirect_uri,
      code: code,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      body: tokenParams,
    });
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return res.status(400).json({ 
        error: tokenData.error_message || "Failed to exchange code for token",
        details: tokenData
      });
    }

    const shortLivedToken = tokenData.access_token;
    const instagramUserId = tokenData.user_id;

    // Step 2: Exchange for long-lived token
    let longLivedToken = shortLivedToken;
    let expiresIn = 3600;

    const longTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;
    const longTokenResponse = await fetch(longTokenUrl);
    const longTokenData = await longTokenResponse.json();

    if (longTokenData.access_token) {
      longLivedToken = longTokenData.access_token;
      expiresIn = longTokenData.expires_in || 5184000;
    }

    // Step 3: Get user profile
    const profileUrl = `https://graph.instagram.com/v23.0/me?fields=user_id,username,account_type,name&access_token=${longLivedToken}`;
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();

    return res.status(200).json({
      access_token: longLivedToken,
      user_id: instagramUserId,
      expires_in: expiresIn,
      username: profileData.username,
      name: profileData.name,
      account_type: profileData.account_type,
    });
  } catch (error: any) {
    console.error("Instagram token exchange error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
