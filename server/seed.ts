import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    const industryPassword = await bcrypt.hash("industry123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const industry1 = await storage.createUser({
      username: "acme_industrial",
      email: "contact@acmeindustrial.com",
      password: industryPassword,
      role: "industry",
      companyName: "ACME Industrial Equipment",
    });

    const industry2 = await storage.createUser({
      username: "techforge_mfg",
      email: "sales@techforge.com",
      password: industryPassword,
      role: "industry",
      companyName: "TechForge Manufacturing",
    });

    console.log("✅ Created industry users");

    const user1 = await storage.createUser({
      username: "john_builder",
      email: "john@example.com",
      password: userPassword,
      role: "user",
    });

    const user2 = await storage.createUser({
      username: "sarah_contractor",
      email: "sarah@example.com",
      password: userPassword,
      role: "user",
    });

    console.log("✅ Created regular users");

    const purchaseDate1 = new Date("2022-03-15");
    const warrantyExpiry1 = new Date("2025-03-15");
    const purchaseDate2 = new Date("2021-06-20");
    const warrantyExpiry2 = new Date("2024-06-20");

    const item1 = await storage.createItem({
      name: "CNC Milling Machine",
      description: "High-precision CNC milling machine with 3-axis control. Perfect for metalworking and prototyping.",
      category: "Machinery",
      pricePerDay: "250.00",
      quantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
      industryId: industry1.id,
      machineType: "CNC Machine",
      purchaseDate: purchaseDate1,
      warrantyExpiry: warrantyExpiry1,
    });

    const item2 = await storage.createItem({
      name: "Hydraulic Press 50 Ton",
      description: "Industrial hydraulic press with 50-ton capacity. Ideal for metal forming and stamping operations.",
      category: "Machinery",
      pricePerDay: "180.00",
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800",
      industryId: industry1.id,
      machineType: "Hydraulic Press",
      purchaseDate: purchaseDate2,
      warrantyExpiry: warrantyExpiry2,
    });

    const item3 = await storage.createItem({
      name: "Welding Robot Arm",
      description: "Automated robotic welding arm with precision control. Reduces manual labor and improves quality.",
      category: "Automation",
      pricePerDay: "320.00",
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=800",
      industryId: industry2.id,
      machineType: "Robotic Welder",
      purchaseDate: new Date("2023-01-10"),
      warrantyExpiry: new Date("2026-01-10"),
    });

    const item4 = await storage.createItem({
      name: "Laser Cutting Machine",
      description: "CO2 laser cutter for precise metal and plastic cutting. Computerized control system included.",
      category: "Cutting Equipment",
      pricePerDay: "275.00",
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1614064745704-8e5a0e5b2f29?w=800",
      industryId: industry2.id,
      machineType: "Laser Cutter",
      purchaseDate: new Date("2022-09-05"),
      warrantyExpiry: new Date("2025-09-05"),
    });

    console.log("✅ Created items");

    await storage.createMachinePart({
      machineType: "CNC Machine",
      partName: "Spindle Motor",
      partNumber: "CNC-SM-2000",
      description: "Main spindle motor assembly",
      location: "Top center of machine, inside protective housing",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
      diagramImageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150",
      positionX: 50,
      positionY: 15,
    });

    await storage.createMachinePart({
      machineType: "CNC Machine",
      partName: "Linear Guide Rails",
      partNumber: "CNC-LGR-X",
      description: "X-axis linear guide rail system",
      location: "Bottom front, running left to right",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
      diagramImageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150",
      positionX: 50,
      positionY: 85,
    });

    await storage.createMachinePart({
      machineType: "CNC Machine",
      partName: "Tool Changer",
      partNumber: "CNC-TC-12",
      description: "Automatic tool changing mechanism",
      location: "Right side of machine head",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
      diagramImageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150",
      positionX: 85,
      positionY: 35,
    });

    await storage.createMachinePart({
      machineType: "Hydraulic Press",
      partName: "Hydraulic Cylinder",
      partNumber: "HP-HC-50",
      description: "Main hydraulic cylinder assembly",
      location: "Center top, vertical orientation",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
    });

    await storage.createMachinePart({
      machineType: "Hydraulic Press",
      partName: "Pressure Gauge",
      partNumber: "HP-PG-5000",
      description: "Hydraulic pressure monitoring gauge",
      location: "Front panel, top right corner",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
    });

    await storage.createMachinePart({
      machineType: "Hydraulic Press",
      partName: "Safety Release Valve",
      partNumber: "HP-SRV-50",
      description: "Emergency pressure release valve",
      location: "Left side, mid-height",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400",
    });

    console.log("✅ Created machine parts");

    await storage.createHealthReport({
      itemId: item1.id,
      overallCondition: "excellent",
      conditionScore: 92,
      visualInspection: "No visible scratches or dents. Paint finish intact. All guards in place.",
      functionalTest: "All axes move smoothly. Spindle runs true. Tool changer operates correctly.",
      wearAndTear: "Minimal wear on guide rails. Spindle bearings show normal operating characteristics.",
      defects: ["Minor cosmetic scratch on side panel"],
      maintenanceHistory: [
        { date: "2024-11-01", description: "Spindle bearings lubrication and inspection" },
        { date: "2024-09-15", description: "Linear guide rails cleaning and lubrication" },
        { date: "2024-07-20", description: "Complete preventive maintenance service" }
      ],
      estimatedLifeRemaining: "8-10 years with regular maintenance",
      inspectedBy: "Certified Technician - Mike Johnson",
    });

    await storage.createHealthReport({
      itemId: item2.id,
      overallCondition: "good",
      conditionScore: 78,
      visualInspection: "Minor surface rust on base plate. Hydraulic lines show age but no leaks.",
      functionalTest: "Press cycles normally. Pressure holds steady. Controls responsive.",
      wearAndTear: "Cylinder seals at 70% life. Base plate shows wear from material handling.",
      defects: ["Surface rust on base", "Worn safety guard latch"],
      maintenanceHistory: [
        { date: "2024-10-10", description: "Hydraulic fluid change and filter replacement" },
        { date: "2024-06-05", description: "Safety system inspection" },
        { date: "2024-03-12", description: "Cylinder seal inspection" }
      ],
      estimatedLifeRemaining: "5-7 years, seal replacement recommended within 12 months",
      inspectedBy: "Certified Technician - Lisa Martinez",
    });

    await storage.createHealthReport({
      itemId: item3.id,
      overallCondition: "excellent",
      conditionScore: 95,
      visualInspection: "Like new condition. No visible wear on any components.",
      functionalTest: "All 6 axes operate smoothly. Welding parameters consistent. Safety systems functional.",
      wearAndTear: "Negligible wear. Unit has low operating hours.",
      defects: [],
      maintenanceHistory: [
        { date: "2024-11-10", description: "Routine calibration and software update" },
        { date: "2024-08-22", description: "Preventive maintenance inspection" }
      ],
      estimatedLifeRemaining: "15+ years",
      inspectedBy: "Certified Technician - David Chen",
    });

    console.log("✅ Created health reports");

    await storage.createAppraisal({
      itemId: item1.id,
      appraisalMethod: "hybrid",
      estimatedValue: "42000.00",
      conditionFactor: "0.92",
      ageFactor: "0.85",
      marketDemand: "high",
      mlConfidence: "0.88",
      imageAnalysis: {
        defects: ["minor surface scratch"],
        quality_score: 92
      },
      notes: "Excellent condition CNC machine. High demand in current market. Original purchase price $55,000.",
      appraisedBy: "AI Vision Model v2.1 + Expert Review",
    });

    await storage.createAppraisal({
      itemId: item2.id,
      appraisalMethod: "hybrid",
      estimatedValue: "28500.00",
      conditionFactor: "0.78",
      ageFactor: "0.65",
      marketDemand: "medium",
      mlConfidence: "0.82",
      imageAnalysis: {
        defects: ["surface rust", "worn safety guard"],
        quality_score: 78
      },
      notes: "Good working condition but showing age. Seal replacement recommended. Original purchase price $48,000.",
      appraisedBy: "AI Vision Model v2.1 + Expert Review",
    });

    await storage.createAppraisal({
      itemId: item3.id,
      appraisalMethod: "ml_vision",
      estimatedValue: "65000.00",
      conditionFactor: "0.95",
      ageFactor: "0.90",
      marketDemand: "high",
      mlConfidence: "0.94",
      imageAnalysis: {
        defects: [],
        quality_score: 95
      },
      notes: "Near-new robotic welder. Very high market demand. Low operating hours. Original purchase price $72,000.",
      appraisedBy: "AI Vision Model v2.1",
    });

    console.log("✅ Created appraisals");

    await storage.createExchange({
      offeredItemId: item1.id,
      requestedItemId: item4.id,
      offererId: industry1.id,
      receiverId: industry2.id,
      exchangeType: "item_for_item",
      cashAmount: "0.00",
      notes: "Looking to exchange CNC machine for laser cutter. Both machines in excellent condition.",
    });

    await storage.createExchange({
      offeredItemId: item2.id,
      requestedItemId: null,
      offererId: industry1.id,
      receiverId: null,
      exchangeType: "item_for_cash",
      cashAmount: "28000.00",
      notes: "Selling hydraulic press. Recent maintenance completed. Ready for immediate use.",
    });

    console.log("✅ Created exchange offers");

    await storage.createRental({
      itemId: item1.id,
      userId: user1.id,
      industryId: industry1.id,
      startDate: new Date(),
      days: 30,
      totalAmount: "7500.00",
    });

    console.log("✅ Created sample rental");

    const roboticsIndustry = await storage.createUser({
      username: "acme_robotics",
      email: "contact@acme-robotics.com",
      password: await bcrypt.hash("password123", 10),
      role: "industry",
      companyName: "ACME Robotics",
    });

    const irb1600Robot = await storage.createItem({
      name: "Welding Robot Arm IRB 1600",
      description: "Industrial welding robot with 6-axis movement and precision control. Payload capacity: 10kg, Reach: 1.45m. Perfect for automated welding, material handling, and assembly operations.",
      category: "Automation",
      pricePerDay: "320.00",
      quantity: 1,
      imageUrl: "/images/IRB_1600_robot_main_body_763c8594.png",
      industryId: roboticsIndustry.id,
      machineType: "IRB 1600",
      purchaseDate: new Date("2021-06-20"),
      warrantyExpiry: new Date("2024-06-20"),
    });

    await storage.createItem({
      name: "Vacuum Gripper System",
      description: "High-performance vacuum gripper for automated picking and placing systems",
      category: "Components",
      pricePerDay: "150.00",
      quantity: 3,
      imageUrl: "/images/Vacuum_gripper_robot_part_6c59963c.png",
      industryId: roboticsIndustry.id,
      machineType: "Pneumatic Gripper",
      parentItemId: irb1600Robot.id,
      partPosition: "top-left",
      purchaseDate: new Date("2023-03-10"),
      warrantyExpiry: new Date("2026-03-10"),
    });

    await storage.createItem({
      name: "Magnetic Gripper Pro",
      description: "Powerful electromagnetic gripper for heavy metal parts handling",
      category: "Components",
      pricePerDay: "120.00",
      quantity: 2,
      imageUrl: "/images/Magnetic_gripper_robot_part_33f8af0b.png",
      industryId: roboticsIndustry.id,
      machineType: "Magnetic Gripper",
      parentItemId: irb1600Robot.id,
      partPosition: "top-right",
      purchaseDate: new Date("2022-11-05"),
      warrantyExpiry: new Date("2025-11-05"),
    });

    await storage.createItem({
      name: "Precision Cutting Tool",
      description: "High-precision cutting tool attachment for detailed work",
      category: "Components",
      pricePerDay: "180.00",
      quantity: 2,
      imageUrl: "/images/Cutting_tool_robot_part_0711d221.png",
      industryId: roboticsIndustry.id,
      machineType: "Cutting Tool",
      parentItemId: irb1600Robot.id,
      partPosition: "middle-left",
      purchaseDate: new Date("2022-08-15"),
      warrantyExpiry: new Date("2025-08-15"),
    });

    await storage.createItem({
      name: "Spray Painting Nozzle",
      description: "Automated spray painting nozzle with precision control",
      category: "Components",
      pricePerDay: "160.00",
      quantity: 2,
      imageUrl: "/images/Spray_painting_robot_part_59dc4833.png",
      industryId: roboticsIndustry.id,
      machineType: "Spray Nozzle",
      parentItemId: irb1600Robot.id,
      partPosition: "middle-right",
      purchaseDate: new Date("2022-09-20"),
      warrantyExpiry: new Date("2025-09-20"),
    });

    await storage.createHealthReport({
      itemId: irb1600Robot.id,
      overallCondition: "excellent",
      conditionScore: 88,
      visualInspection: "No visible damage or wear. All parts in good condition.",
      functionalTest: "All 6 axes functioning perfectly. Precision within tolerance. No unusual sounds or vibrations.",
      wearAndTear: "Minimal wear on moving parts. Regular maintenance has been performed.",
      defects: [],
      maintenanceHistory: [
        { date: "2024-11-01", description: "Routine maintenance and lubrication" },
        { date: "2024-08-15", description: "Software update and calibration" },
        { date: "2024-05-20", description: "Full system inspection and parts replacement" }
      ],
      estimatedLifeRemaining: "8 years with proper maintenance",
      inspectedBy: "Certified Robotics Technician",
    });

    console.log("✅ Created IRB 1600 robot with 4 parts (as items)");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Sample Data Summary:");
    console.log("   - 3 Industry users (acme_industrial, techforge_mfg, acme_robotics / password: industry123 or password123)");
    console.log("   - 2 Regular users (username: john_builder, sarah_contractor / password: user123)");
    console.log("   - 5 Main equipment items + 4 parts (IRB 1600 parts) = 9 total items");
    console.log("   - 6 Machine parts blueprints with locations");
    console.log("   - 4 Health reports with detailed inspection data");
    console.log("   - 3 AI appraisals with condition scoring");
    console.log("   - 2 Exchange offers");
    console.log("   - 1 Active rental");
    console.log("\n🤖 IRB 1600 Robot System:");
    console.log("   - Main Machine: Welding Robot Arm IRB 1600");
    console.log("   - 4 Parts: Vacuum Gripper (top-left), Magnetic Gripper (top-right),");
    console.log("              Cutting Tool (middle-left), Spray Nozzle (middle-right)\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedDatabase();
