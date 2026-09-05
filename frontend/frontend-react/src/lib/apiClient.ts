export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  // 401 Unauthorized 발생 시 Silent Refresh 시도
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshRes = await fetch("http://localhost:8081/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data: { accessToken: string; refreshToken: string } = await refreshRes.json();
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // 새로운 토큰으로 헤더 교체 후 재요청
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh Token도 만료되었으면 로그아웃
          localStorage.clear();
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Silent Refresh 실패:", err);
      }
    }
  }

  return response;
}