import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Activity, Microscope, Scissors, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Stethoscope,
    title: "General Checkup",
    description: "Comprehensive health examination for your pet's wellbeing",
    price: "$50",
  },
  {
    icon: Heart,
    title: "Emergency Care",
    description: "24/7 emergency veterinary services for critical situations",
    price: "$150",
  },
  {
    icon: Activity,
    title: "Surgery",
    description: "Advanced surgical procedures with expert veterinarians",
    price: "$500+",
  },
  {
    icon: Microscope,
    title: "Lab Tests",
    description: "Complete diagnostic testing and blood work analysis",
    price: "$75",
  },
  {
    icon: Scissors,
    title: "Grooming",
    description: "Professional grooming services for all breeds",
    price: "$40",
  },
  {
    icon: Clock,
    title: "Wellness Plans",
    description: "Monthly subscription for regular health monitoring",
    price: "$99/mo",
  },
];

export const VetServices = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Veterinary Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert care from certified veterinarians. Your pet's health is our priority.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 border-2"
              >
                <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-xl">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4 min-h-[48px]">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                  {/* All regular "Book Now" buttons link to the bookings tab */}
                  <Link to="/owner-dashboard?tab=bookings">
                    <Button size="sm" variant="outline">Book Now</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our emergency hotline is available 24/7 for urgent pet care situations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {/* The Emergency Consult button also links to the bookings tab for quick action */}
            <Link to="/owner-dashboard?tab=bookings">
              <Button variant="hero" size="lg" className="gap-2">
                <Heart className="h-5 w-5" />
                Book Emergency Video Consult
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};