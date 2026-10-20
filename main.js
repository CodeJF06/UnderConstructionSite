export default {
  async fetch(request) {
    const html = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Im Aufbau | feh.re</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .card {
            padding: 2.5rem;
            background-color: #1e293b;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          h1 { margin-top: 0; font-size: 1.8rem; }
          p { color: #94a3b8; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚧 Under Construction</h1>
          <p>Hier entsteht gerade etwas Neues. Schau bald wieder vorbei!</p>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
