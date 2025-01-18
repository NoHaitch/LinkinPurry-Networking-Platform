import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MessageSquare, Users } from "lucide-react";

function About() {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <Navbar />
      <main className="container mx-auto mt-12 flex-1 px-4 py-8 sm:py-16">
        <h1 className="mb-8 text-center text-3xl font-bold sm:text-4xl lg:text-5xl">
          About LinkInPurry
        </h1>

        <section className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                LinkInPurry is a professional networking platform designed to
                connect job seekers, employers, and professionals across various
                industries. Our mission is to create meaningful connections that
                lead to career growth and opportunities.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Briefcase,
                title: "Job Opportunities",
                description:
                  "Discover and apply for job openings that match your skills and aspirations. Connect with employers and recruiters directly.",
              },
              {
                icon: Users,
                title: "Professional Networking",
                description:
                  "Build and maintain your professional network. Connect with colleagues, industry experts, and potential mentors to expand your career horizons.",
              },
              {
                icon: MessageSquare,
                title: "Private Messaging",
                description:
                  "Communicate securely with your connections through our private messaging system. Discuss job opportunities, share insights, and build relationships.",
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Join LinkInPurry Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Whether you're looking for your next career move, aiming to
                expand your professional network, or seeking to hire top talent,
                LinkInPurry provides the platform to achieve your goals. Sign up
                now and start connecting with professionals in your industry!
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <div className="bg-white">
        <Footer />
      </div>
    </div>
  );
}

export default About;
