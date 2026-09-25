export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Data Deletion</h1>
        <p className="mb-8 text-sm text-gray-500">
          SupportAI User Data Deletion Instructions
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              Requesting Data Deletion
            </h2>

            <p>
              If you would like to request deletion of your SupportAI account
              or personal information, please contact the SupportAI team and
              provide the email address or phone number associated with your
              account.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              WhatsApp Users
            </h2>

            <p>
              If you have contacted SupportAI through WhatsApp, you may request
              deletion of information associated with your WhatsApp phone
              number and support conversations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              What Happens After a Request
            </h2>

            <p>
              After receiving a valid deletion request, the SupportAI team
              will review the request and take appropriate steps to delete
              applicable personal information, subject to applicable legal or
              operational requirements.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">Contact</h2>

            <p>
              To request data deletion, contact the SupportAI team with your
              registered email address or WhatsApp phone number.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}