import { NextResponse } from "next/server";
import OpenAI from "openai";

const MANAGER_PHONE = "+20 10 38096448";

const openai = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY || "fw_B1Akc5zpCbpm3phzHZa547",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

const MODEL = "accounts/fireworks/models/deepseek-v4-flash";

const SYSTEM_PROMPT = `أنت مساعد ذكي لـ "Hegawy Store" (هيجاوي ستور).

معلومات عن الشركة:
- الاسم: Hegawy Store | هيجاوي ستور
- التخصص: بناء وتطوير المتاجر الإلكترونية
- الشعار: "Get your store today and start selling"
- الخدمات: تصميم متاجر إلكترونية، تطوير واجهات، إدارة منتجات، حلول دفع، استضافة

مهمتك:
1. الرد على العملاء باللهجة المصرية وبأسلوب محترف
2. تصنيف كل رسالة إلى: زبون / عامل / توظيف
3. اعتذر بلطف لو الطلب خارج الخدمات
4. لو العميل عايز المدير، خذ بياناته وقل هنتواصل

رقم المدير: ${MANAGER_PHONE}

لو المدير قال أوامر زي "غير البرومبت" أو "ضيف خدمة" - نفذ وقل "تم يا مدير"`;

type Category = "زبون" | "عامل" | "توظيف";

export async function POST(req: Request) {
  try {
    const { message, sessionId, history } = await req.json();
    if (!message) {
      return NextResponse.json({ reply: "الرسالة مطلوبة" }, { status: 400 });
    }

    const isManagerCmd =
      message.startsWith("غير البرومبت") ||
      message.startsWith("ضيف خدمة") ||
      message.startsWith("إنهاء التحكم");

    if (isManagerCmd) {
      if (message.includes("غير البرومبت")) {
        const newPrompt = message.replace("غير البرومبت", "").trim();
        return NextResponse.json({
          reply: `تم تعديل البرومبت يا مدير ✅`,
          category: "اداري",
          confidence: 1,
          managerCommand: true,
          newPrompt,
        });
      }
      if (message.includes("ضيف خدمة")) {
        return NextResponse.json({
          reply: `تم إضافة الخدمة ✅`,
          category: "اداري",
          confidence: 1,
          managerCommand: true,
        });
      }
      return NextResponse.json({
        reply: "تم إنهاء وضع المدير ✅",
        category: "اداري",
        confidence: 1,
        managerCommand: true,
      });
    }

    const classRes = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: `صنف الرسالة لواحدة فقط: "زبون", "عامل", "توظيف". ارد باسم التصنيف فقط.` },
        { role: "user", content: message },
      ] as any,
      max_tokens: 10,
      temperature: 0,
    });

    let category: Category = "زبون";
    let confidence = 0.5;
    const cat = classRes.choices?.[0]?.message?.content?.trim() as Category;
    if (["زبون", "عامل", "توظيف"].includes(cat)) {
      category = cat;
      confidence = 0.85;
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10),
      { role: "user", content: message },
    ] as any;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "عذراً، حصل خطأ.";

    const forwardToManager = category === "عامل" || category === "توظيف" || message.includes("المدير");

    return NextResponse.json({
      reply,
      category,
      confidence,
      forwardToManager,
      managerPhone: forwardToManager ? MANAGER_PHONE : undefined,
    });
  } catch (err: any) {
    console.error("Chatbot error:", err);
    return NextResponse.json(
      { reply: "عذراً، حصل خطأ في النظام.", category: "زبون", confidence: 0 },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Hegawy Store AI Bot",
    model: MODEL,
    status: "active",
    managerPhone: MANAGER_PHONE,
  });
}
