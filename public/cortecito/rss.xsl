<?xml version="1.0" encoding="UTF-8"?>
<!--
  Human-friendly view of the RSS feed (browsers show raw XML otherwise).
  Feed readers ignore this file and read the feed itself.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="es-AR">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="color-scheme" content="dark light"/>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <style>
          :root { color-scheme: dark; --bg:#1c1c1c; --card:#262626; --fg:#f5f2ee; --muted:#a3a3a3; --line:#3a3a3a; --brand:#ff6600; --on:#1c1c1c; }
          @media (prefers-color-scheme: light) { :root { color-scheme: light; --bg:#f6f3ef; --card:#fff; --fg:#1c1c1c; --muted:#5c5249; --line:#d9d4cd; --brand:#b34700; --on:#fff; } }
          * { box-sizing: border-box; }
          body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.6 Poppins, system-ui, -apple-system, "Segoe UI", sans-serif; }
          main { max-width:42rem; margin:0 auto; padding:2.5rem 1.25rem 4rem; }
          h1 { font-size:clamp(1.8rem,5vw,2.5rem); line-height:1.1; margin:.5rem 0; letter-spacing:-.02em; }
          .kicker { color:var(--brand); font-weight:600; margin:0; }
          .lede { color:var(--muted); margin:.5rem 0 1.5rem; }
          .note { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:1rem 1.25rem; margin:0 0 2rem; font-size:.95rem; color:var(--muted); }
          .note strong { color:var(--fg); }
          .btn { display:inline-flex; align-items:center; min-height:48px; padding:0 1.4rem; border-radius:999px; background:var(--brand); color:var(--on); font-weight:700; text-decoration:none; }
          ol { list-style:none; margin:0; padding:0; display:grid; gap:1rem; }
          li { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:1.1rem 1.25rem; }
          li h2 { font-size:1.15rem; margin:.15rem 0 .35rem; }
          li h2 a { color:var(--fg); text-decoration:none; }
          li h2 a:hover { color:var(--brand); }
          time { color:var(--brand); font-size:.85rem; font-weight:600; }
          li p { margin:0; color:var(--muted); }
          :focus-visible { outline:3px solid var(--brand); outline-offset:3px; }
        </style>
      </head>
      <body>
        <main>
          <p class="kicker">Feed RSS</p>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="lede"><xsl:value-of select="/rss/channel/description"/></p>
          <p class="note">
            <strong>Esto es un feed RSS.</strong> Copiá la dirección de esta página y pegala en tu lector de noticias
            (Feedly, NetNewsWire, Thunderbird…) para enterarte de cada novedad sin entrar al sitio.
          </p>
          <ol>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <time><xsl:value-of select="substring(pubDate, 6, 11)"/></time>
                <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
                <p><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ol>
          <p style="margin-top:2rem"><a class="btn" href="{/rss/channel/item[1]/link}">Ver las novedades en el sitio</a></p>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
