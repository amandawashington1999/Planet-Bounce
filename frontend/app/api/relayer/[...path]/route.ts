import { NextRequest, NextResponse } from "next/server";

const RELAYER_URL = "https://relayer.testnet.zama.org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const targetUrl = `${RELAYER_URL}${targetPath}${request.nextUrl.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Proxy error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const targetUrl = `${RELAYER_URL}${targetPath}`;

  try {
    const body = await request.text();
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Proxy error" },
      { status: 500 }
    );
  }
}

