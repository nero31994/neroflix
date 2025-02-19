export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Movie ID is required" });

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove pop-ups, redirects, and unwanted scripts
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
            .replace(/window\.open/g, '') // Block pop-ups
            .replace(/location\.href/g, ''); // Block redirects

        // Inject custom CSS & JavaScript for fullscreen video + anti-clickjacking
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                iframe { width: 100vw !important; height: 100vh !important; border: none; position: absolute; top: 0; left: 0; z-index: 10; }
                a, div[onclick], div[onmousedown], div[onmouseup] { pointer-events: none !important; } /* Block hidden ad layers */
            </style>
            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    // Block click events that cause redirects
                    document.body.addEventListener("click", (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }, true);

                    // Remove hidden overlays that hijack clicks
                    setInterval(() => {
                        document.querySelectorAll("div, a, iframe").forEach(el => {
                            if (window.getComputedStyle(el).zIndex > 1000) {
                                el.remove();
                            }
                        });
                    }, 1000);
                });
            </script>
            </head>
        `);

        res.setHeader("Content-Type", "text/html");
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video" });
    }
}
