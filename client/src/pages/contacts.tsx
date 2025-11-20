import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Wrench, Zap, Cog, Factory, User, HeadphonesIcon } from "lucide-react";
import type { ExpertContact } from "@shared/schema";

const roleIcons = {
  cnc_expert: <Cog className="w-5 h-5" />,
  hydraulic_expert: <Factory className="w-5 h-5" />,
  electrical_expert: <Zap className="w-5 h-5" />,
  mechanical_expert: <Wrench className="w-5 h-5" />,
  industrial_automation_expert: <Factory className="w-5 h-5" />,
  customer_support: <HeadphonesIcon className="w-5 h-5" />,
};

const roleLabels = {
  cnc_expert: "CNC Machinery Expert",
  hydraulic_expert: "Hydraulic Systems Expert",
  electrical_expert: "Electrical Systems Expert",
  mechanical_expert: "Mechanical Engineering Expert",
  industrial_automation_expert: "Industrial Automation Expert",
  customer_support: "Customer Support",
};

export default function ContactsPage() {
  const { data: contacts, isLoading } = useQuery<ExpertContact[]>({
    queryKey: ["/api/contacts"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const experts = contacts?.filter(c => c.role !== 'customer_support') || [];
  const support = contacts?.find(c => c.role === 'customer_support');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-contacts-title">
            Expert Contacts
          </h1>
          <p className="text-muted-foreground" data-testid="text-contacts-subtitle">
            Connect directly with our machinery experts and support team
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4" data-testid="text-machinery-experts">
              Machinery Experts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <Card key={expert.id} data-testid={`card-expert-${expert.role}`} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl" data-testid={`text-expert-name-${expert.role}`}>
                          {expert.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {roleIcons[expert.role as keyof typeof roleIcons]}
                          <span data-testid={`text-expert-role-${expert.role}`}>
                            {roleLabels[expert.role as keyof typeof roleLabels]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription data-testid={`text-expert-expertise-${expert.role}`}>
                      {expert.expertise}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      data-testid={`button-call-${expert.role}`}
                    >
                      <a href={`tel:${expert.phone}`} className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call Now
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      data-testid={`button-email-${expert.role}`}
                    >
                      <a href={`mailto:${expert.email}`} className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Send Email
                      </a>
                    </Button>
                    <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2" data-testid={`text-phone-${expert.role}`}>
                        <Phone className="w-3 h-3" />
                        {expert.phone}
                      </div>
                      <div className="flex items-center gap-2" data-testid={`text-email-${expert.role}`}>
                        <Mail className="w-3 h-3" />
                        {expert.email}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {support && (
            <div>
              <h2 className="text-2xl font-semibold mb-4" data-testid="text-customer-support">
                Customer Support
              </h2>
              <Card data-testid="card-support" className="max-w-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {support.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl" data-testid="text-support-name">
                        {support.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        {roleIcons.customer_support}
                        <span data-testid="text-support-role">Customer Support</span>
                      </div>
                    </div>
                  </div>
                  <CardDescription data-testid="text-support-expertise">
                    {support.expertise}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      variant="default"
                      data-testid="button-call-support"
                    >
                      <a href={`tel:${support.phone}`} className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call Now
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      data-testid="button-email-support"
                    >
                      <a href={`mailto:${support.email}`} className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Send Email
                      </a>
                    </Button>
                  </div>
                  <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2" data-testid="text-support-phone">
                      <Phone className="w-3 h-3" />
                      {support.phone}
                    </div>
                    <div className="flex items-center gap-2" data-testid="text-support-email">
                      <Mail className="w-3 h-3" />
                      {support.email}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
