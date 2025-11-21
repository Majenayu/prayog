import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Sparkles } from "lucide-react";
import excavatorImg from "@assets/generated_images/construction_excavator_equipment_photo.png";
import powerToolsImg from "@assets/generated_images/power_tools_equipment_photo.png";
import invoiceImg from "@assets/generated_images/sample_equipment_rental_invoice.png";

export default function DemoFiles() {
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const demoFiles = [
    {
      title: "Construction Equipment Photo",
      description: "High-quality excavator equipment image for testing AI analysis",
      image: excavatorImg,
      filename: "demo-excavator-equipment.png",
      type: "equipment"
    },
    {
      title: "Power Tools Photo",
      description: "Industrial power tools image for testing AI analysis",
      image: powerToolsImg,
      filename: "demo-power-tools.png",
      type: "equipment"
    },
    {
      title: "Sample Invoice/Bill",
      description: "Equipment rental invoice template for testing bill analysis",
      image: invoiceImg,
      filename: "demo-invoice.png",
      type: "bill"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Demo Files for AI Analysis</h1>
        </div>
        <p className="text-muted-foreground">
          Download sample equipment photos and bills to test the AI-powered equipment analysis feature.
          These demo files are perfect for testing before uploading your real equipment data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoFiles.map((file, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {file.type === "equipment" ? (
                    <FileImage className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                  <CardTitle className="text-lg">{file.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{file.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={file.image}
                    alt={file.title}
                    className="w-full h-full object-cover"
                    data-testid={`img-demo-${index}`}
                  />
                </div>
                <Button
                  onClick={() => downloadImage(file.image, file.filename)}
                  className="w-full"
                  data-testid={`button-download-${index}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {file.type === "equipment" ? "Equipment Photo" : "Invoice"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use Demo Files</CardTitle>
          <CardDescription>Follow these steps to test the AI analysis feature</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Download one equipment photo (excavator or power tools)</li>
            <li>Download the sample invoice/bill</li>
            <li>Go to the Exchange Marketplace section</li>
            <li>Click on "AI-Powered Listing" button</li>
            <li>Upload the equipment photo as "Equipment Photo"</li>
            <li>Upload the invoice as "Bill/Invoice Photo"</li>
            <li>Click "Analyze & List Equipment" to see AI analysis in action</li>
            <li>Once you're comfortable with the process, replace with your real equipment photos and bills</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Analysis Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">From Equipment Photo:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Product identification & type</li>
                <li>Condition assessment (VCI score)</li>
                <li>Wear pattern detection</li>
                <li>Visual defect analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">From Bill/Invoice:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Original purchase price</li>
                <li>Purchase date extraction</li>
                <li>Part number & manufacturer</li>
                <li>Material specifications</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">AI Predictions:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Remaining Useful Life (RUL) estimation</li>
              <li>Current market value calculation</li>
              <li>Depreciation rate analysis</li>
              <li>Usability status & recommendations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
