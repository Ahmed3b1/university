import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GraduateProgram from "@/models/GraduateProgram";
import { getSession } from "@/lib/auth";
import { createGraduateProgramSchema } from "@/lib/validations";
import { getT } from "@/lib/i18n/server"

export async function GET() {
  try {
    await dbConnect();

    const programs = await GraduateProgram.find()
      .populate("coordinator", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, programs });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const t = await getT()

  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: t("غير مسجل"),
        },
        { status: 401 }
      );
    }

    if (session.role === "student") {
      return NextResponse.json(
        {
          success: false,
          message: t("غير مصرح لك"),
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const validationResult =
      createGraduateProgramSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        (e) => t(e.message)
      );

      return NextResponse.json(
        {
          success: false,
          message: errors[0],
        },
        { status: 400 }
      );
    }

    const program = await GraduateProgram.create({
      ...validationResult.data,
      coordinator: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: t("تم إنشاء البرنامج بنجاح"),
      program,
    });
  } catch (err) {
    console.error("Graduate Program Creation Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: t("حدث خطأ أثناء إنشاء البرنامج"),
      },
      { status: 500 }
    );
  }
}