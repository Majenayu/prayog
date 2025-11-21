import bcrypt from "bcryptjs";
import { UserModel, ExpertContactModel } from "./mongo-models";

export async function seedMongoData() {
  try {
    // Check if admin user exists
    const existingAdmin = await UserModel.findOne({ username: "ayusha" });
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("ayusha", 10);
      await UserModel.create({
        username: "ayusha",
        email: "admin@renthub.com",
        password: hashedPassword,
        role: "admin",
        companyName: "RentHub Admin",
      });
      console.log("✓ Admin user 'ayusha' created successfully");
    } else {
      console.log("✓ Admin user 'ayusha' already exists");
    }

    // Check if expert contacts exist
    const existingExperts = await ExpertContactModel.countDocuments();
    
    if (existingExperts === 0) {
      // Get contact info from environment
      const contactPhone = process.env.CONTACT_PHONE || "+1 (555) 123-4567";
      const contactEmail = process.env.CONTACT_EMAIL || "support@renthub.com";

      // Create 5 mechanical experts and customer support
      const experts = [
        {
          name: "Dr. Rajesh Kumar",
          role: "cnc_expert",
          expertise: "CNC Machinery specialist with 15+ years experience in precision machining and CAM programming. Expert in troubleshooting Haas, Mazak, and DMG MORI systems.",
          phone: contactPhone,
          email: contactEmail,
        },
        {
          name: "Eng. Sarah Mitchell",
          role: "hydraulic_expert",
          expertise: "Hydraulic Systems engineer specializing in industrial press maintenance, cylinder repair, and fluid power optimization. Certified in Parker and Bosch Rexroth systems.",
          phone: contactPhone,
          email: contactEmail,
        },
        {
          name: "Michael Chen",
          role: "electrical_expert",
          expertise: "Electrical Systems specialist with expertise in industrial automation, PLC programming, and motor control systems. Experienced with Siemens, Allen-Bradley, and Schneider Electric.",
          phone: contactPhone,
          email: contactEmail,
        },
        {
          name: "Dr. Priya Sharma",
          role: "mechanical_expert",
          expertise: "Mechanical Engineering expert focusing on heavy machinery diagnostics, vibration analysis, and preventive maintenance strategies. PhD in Mechanical Systems from MIT.",
          phone: contactPhone,
          email: contactEmail,
        },
        {
          name: "James Rodriguez",
          role: "industrial_automation_expert",
          expertise: "Industrial Automation consultant specializing in robotics integration, SCADA systems, and Industry 4.0 implementations. 20+ years in automotive and aerospace manufacturing.",
          phone: contactPhone,
          email: contactEmail,
        },
        {
          name: "RentHub Support Team",
          role: "customer_support",
          expertise: `Available 24/7 for all your equipment rental needs. We're here to help with booking, technical support, and any questions about our machinery rental services. Located at: 12.335627°N, 76.619692°E`,
          phone: contactPhone,
          email: contactEmail,
        },
      ];

      await ExpertContactModel.insertMany(experts);
      console.log(`✓ Created ${experts.length} expert contacts successfully`);
    } else {
      console.log(`✓ Expert contacts already exist (${existingExperts} found)`);
    }

  } catch (error) {
    console.error("Error seeding MongoDB data:", error);
    throw error;
  }
}
