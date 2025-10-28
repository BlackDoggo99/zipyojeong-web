import { NextResponse } from 'next/server';

export async function GET() {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body>
            <script language="javascript" type="text/javascript" src="https://stdpay.inicis.com/stdjs/INIStdPay_close.js" charset="UTF-8"></script>
        </body>
        </html>
    `;
    
    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
        },
    });
}
