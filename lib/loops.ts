const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_TRANSACTIONAL_SIGNIN_EMAIL_ID = process.env.LOOPS_TRANSACTIONAL_SIGNIN_EMAIL_ID;
const LOOPS_TRANSACTIONAL_NOTIFICATION_EMAIL_ID = process.env.LOOPS_TRANSACTIONAL_NOTIFICATION_EMAIL_ID;

if (!LOOPS_TRANSACTIONAL_SIGNIN_EMAIL_ID) throw new Error("Please set LOOPS_TRANSACTIONAL_SIGNIN_EMAIL_ID");
if (!LOOPS_TRANSACTIONAL_NOTIFICATION_EMAIL_ID) throw new Error("Please set LOOPS_TRANSACTIONAL_NOTIFICATION_EMAIL_ID");

async function sendEmailWithLoops(
    transactionEmailId: string,
    targetEmail: string,
    emailParams: Record<string, string>,
) {
    const response = await fetch("https://app.loops.so/api/v1/transactional", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOOPS_API_KEY}`
        },
        body: JSON.stringify({
            transactionalId: transactionEmailId,
            "email": targetEmail,
            "dataVariables": {
                ...emailParams,
            }
        })
    });

    const result = await response.json();
    if (!result.success) throw new Error("Failed to send loops email");
}

export async function sendAuthEmail(targetEmail: string, host: string, signin_url: string) {
    await sendEmailWithLoops(
        LOOPS_TRANSACTIONAL_SIGNIN_EMAIL_ID!,
        targetEmail,
        {
            "hostname": host,
            "signin": signin_url
        }
    );
}

export async function sendNotificationEmail(targetEmail: string, subject: string, content: string) {
    await sendEmailWithLoops(
        LOOPS_TRANSACTIONAL_NOTIFICATION_EMAIL_ID!,
        targetEmail, { content, subject, name: subject });
}