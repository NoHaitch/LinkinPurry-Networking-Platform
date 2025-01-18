import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Mail, Image, FileText } from "lucide-react";

const informationCategories = [
  {
    icon: User,
    title: "Personal Information",
    items: ["Name", "Date of birth", "Gender", "Location"],
  },
  {
    icon: Mail,
    title: "Contact Information",
    items: ["Email address", "Phone number", "Mailing address"],
  },
  {
    icon: Image,
    title: "Profile Content",
    items: [
      "Profile picture",
      "Cover photo",
      "Educational background",
      "Work experience",
    ],
  },
  {
    icon: FileText,
    title: "User-Generated Content",
    items: ["Posts", "Comments", "Messages", "Connections"],
  },
];

function Privacy() {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <Navbar />
      <main className="container mx-auto mt-12 flex-1 px-4 py-8 sm:py-16">
        <h1 className="mb-8 text-center text-3xl font-bold sm:text-4xl lg:text-5xl">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                At LinkInPurry, we value your privacy and are committed to
                protecting your personal information. This privacy policy
                outlines how we collect, use, and safeguard your data when you
                use our platform.
              </p>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Information We Collect
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {informationCategories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" aria-hidden="true" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We use the information we collect to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Provide and improve our services</li>
                <li>Personalize your experience on the platform</li>
                <li>
                  Connect you with other professionals and job opportunities
                </li>
                <li>Send you important updates and notifications</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have the right to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of certain data collection and use</li>
                <li>Control your privacy settings within the platform</li>
              </ul>
              <p className="mt-4">
                For more information about your privacy rights or to make a
                request, please contact us at privacy@linkinpurry.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <div className="bg-white">
        <Footer />
      </div>
    </div>
  );
}

export default Privacy;
