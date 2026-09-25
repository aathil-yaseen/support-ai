export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-sm text-gray-500">
          Last updated: September 25, 2026
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">1. Acceptance</h2>
            <p>
              By using SupportAI, you agree to these Terms of Service and
              agree to use the platform responsibly and lawfully.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">2. Service</h2>
            <p>
              SupportAI provides tools for customer support management,
              including ticket management, knowledge base search, and
              AI-assisted responses.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              3. WhatsApp Support
            </h2>
            <p>
              Users may communicate with SupportAI through WhatsApp where
              available. Messages may be processed to provide support and
              manage related support tickets.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              4. AI-Generated Responses
            </h2>
            <p>
              Some responses provided by SupportAI may be generated or
              assisted by artificial intelligence. Users should contact a
              human support representative when further assistance is
              required.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">
              5. Acceptable Use
            </h2>
            <p>
              Users must not use SupportAI for unlawful activities, abuse,
              harassment, or attempts to compromise the security of the
              service.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold">6. Changes</h2>
            <p>
              These Terms may be updated when necessary. Continued use of
              SupportAI after changes means that you accept the updated Terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}