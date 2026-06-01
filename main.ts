import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.pathname === "/") {
    return Response.json({ message: "FenTik Server is running" }, { headers: corsHeaders });
  }

  if (url.pathname === "/api/tiktok/my-videos") {
    const username = url.searchParams.get("username");
    
    if (!username) {
      return Response.json({ error: "Username required", videos: [] }, { headers: corsHeaders });
    }

    const cleanUsername = username.replace('@', '').toLowerCase();
    
    try {
      const apiUrl = `https://www.tikwm.com/api/user/posts?unique_id=${cleanUsername}&count=30`;
      const res = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const data = await res.json();

      if (data.code === 0 && data.data?.videos) {
        const videos = data.data.videos.map(v => ({
          id: v.video_id,
          url: `https://www.tiktok.com/@${cleanUsername}/video/${v.video_id}`,
          thumbnail: v.cover,
          title: v.title || 'فيديو تيك توك',
          views: v.play_count || 0,
          likes: v.digg_count || 0
        }));
        return Response.json({ videos }, { headers: corsHeaders });
      }
      
      return Response.json({ videos: [] }, { headers: corsHeaders });

    } catch (err) {
      return Response.json({ error: 'API Failed', videos: [] }, { headers: corsHeaders });
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
});
