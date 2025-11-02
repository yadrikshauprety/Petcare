import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Shield, Calendar, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const vaccineSchedule = [
  {
    age: "6-8 Weeks",
    vaccines: ["Distemper", "Parvovirus", "Hepatitis"],
  },
  {
    age: "10-12 Weeks",
    vaccines: ["DHPP Booster", "Leptospirosis", "Bordetella"],
  },
  {
    age: "14-16 Weeks",
    vaccines: ["DHPP Final", "Rabies", "Lyme Disease"],
  },
  {
    age: "Annual",
    vaccines: ["DHPP Booster", "Rabies Booster", "Leptospirosis"],
  },
];

export const Vaccination = () => {
  return (
    <section id="vaccination" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-semibold">Protection First</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Vaccination Schedule
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keep your pet protected with our comprehensive vaccination programs and reminders.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {vaccineSchedule.map((schedule, index) => (
              <Card key={index} className="p-6 border-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Syringe className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">{schedule.age}</h3>
                    <ul className="space-y-2">
                      {schedule.vaccines.map((vaccine, vIndex) => (
                        <li key={vIndex} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          {vaccine}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center bg-gradient-to-b from-card to-primary/5">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Never miss a vaccination date with automated reminders
            </p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-b from-card to-primary/5">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Records</h3>
            <p className="text-sm text-muted-foreground">
              Access your pet's vaccination history anytime, anywhere
            </p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-b from-card to-primary/5">
            <Syringe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expert Care</h3>
            <p className="text-sm text-muted-foreground">
              Administered by licensed veterinarians
            </p>
          </Card>
        </div>

        <div className="text-center">
          {/* UPDATED LINK: Navigate to the Owner Dashboard and open the bookings tab */}
          <Link to="/owner-dashboard?tab=bookings">
            <Button variant="hero" size="lg" className="gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Vaccination
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};