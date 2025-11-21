import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { User, Building2, Sparkles, TrendingUp, Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'industry', 'admin']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'user' | 'industry' | 'admin'>('user');

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      companyName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      // Backend only needs username and password - it returns the actual role from database
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      if (data.user.role === "industry") {
        setLocation("/industry");
      } else if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Account created!",
        description: "Welcome to RentHub.",
      });
      if (data.user.role === "industry") {
        setLocation("/industry");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    // Backend derives role from database, not from client input
    // Only send username and password for authentication
    const { username, password } = data;
    loginMutation.mutate({ username, password });
  };

  const onRegister = (data: RegisterForm) => {
    // Admin registration is disabled - only allow user or industry
    if (selectedRole === 'admin') {
      toast({
        title: "Registration not allowed",
        description: "Admin accounts cannot be registered. Please use the admin seed endpoint.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({ ...data, role: selectedRole });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold tracking-tight">
                RentHub
              </h1>
              <p className="text-xl text-white/90 font-medium">
                The Future of Rental Marketplace
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-start gap-4 backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="bg-white/20 rounded-lg p-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">List Your Equipment</h3>
                  <p className="text-white/80 text-sm">Upload items with photos and start earning</p>
                </div>
              </div>

              <div className="flex items-start gap-4 backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="bg-white/20 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Track Revenue</h3>
                  <p className="text-white/80 text-sm">Real-time analytics and revenue insights</p>
                </div>
              </div>

              <div className="flex items-start gap-4 backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="bg-white/20 rounded-lg p-3">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Manage Inventory</h3>
                  <p className="text-white/80 text-sm">Full control over your rental business</p>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <p className="text-white/60 text-sm">
                Join <span className="font-bold text-white">1,000+</span> businesses already using RentHub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 lg:hidden">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              RentHub
            </h1>
            <p className="text-muted-foreground">The Future of Rental Marketplace</p>
          </div>

          <Card className="border-2">
            <CardHeader className="space-y-4">
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={selectedRole === 'user' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedRole('user');
                    loginForm.setValue('role', 'user');
                    registerForm.setValue('role', 'user');
                  }}
                  className="flex-1"
                  data-testid="button-role-user"
                >
                  <User className="mr-2 h-4 w-4" />
                  User
                </Button>
                <Button
                  variant={selectedRole === 'industry' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedRole('industry');
                    loginForm.setValue('role', 'industry');
                    registerForm.setValue('role', 'industry');
                  }}
                  className="flex-1"
                  data-testid="button-role-industry"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Industry
                </Button>
                <Button
                  variant={selectedRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedRole('admin');
                    loginForm.setValue('role', 'admin');
                    // Don't set registerForm to 'admin' - it's not a valid role in insertUserSchema
                    // Admin registration is disabled anyway
                  }}
                  className="flex-1"
                  data-testid="button-role-admin"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>

              <div>
                <CardTitle className="text-2xl">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? `Sign in to your ${selectedRole} account` 
                    : selectedRole === 'admin' 
                      ? 'Admin registration is disabled' 
                      : `Sign up as ${selectedRole === 'industry' ? 'an' : 'a'} ${selectedRole}`}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={isLogin ? 'login' : 'register'} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="login" 
                    onClick={() => setIsLogin(true)}
                    data-testid="tab-login"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    onClick={() => setIsLogin(false)}
                    data-testid="tab-register"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                data-testid="input-login-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                data-testid="input-login-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  {selectedRole === 'admin' ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Admin accounts cannot be created through registration.</p>
                      <p className="text-sm mt-2">Please use the admin seed endpoint to create an admin account.</p>
                    </div>
                  ) : (
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                data-testid="input-register-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                {...field} 
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedRole === 'industry' && (
                        <FormField
                          control={registerForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your company name" 
                                  {...field} 
                                  data-testid="input-register-company"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                                data-testid="input-register-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
