import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrivacyData } from "@/types/privacy";
import jsPDF from "jspdf";

interface ExportPDFProps {
  data: PrivacyData;
}

export function ExportPDF({ data }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const getGradeColor = (grade: string): [number, number, number] => {
    switch (grade) {
      case "A+":
      case "A":
        return [34, 197, 94]; // green
      case "B":
        return [20, 241, 149]; // primary
      case "C":
        return [245, 158, 11]; // amber
      case "D":
      case "F":
        return [239, 68, 68]; // red
      default:
        return [148, 163, 184]; // gray
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Helper functions
      const addText = (text: string, size: number, color: [number, number, number] = [255, 255, 255], bold = false) => {
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        if (bold) pdf.setFont("helvetica", "bold");
        else pdf.setFont("helvetica", "normal");
        pdf.text(text, margin, yPos);
        yPos += size * 0.5;
      };

      const addLine = () => {
        pdf.setDrawColor(60, 60, 80);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      const checkPageBreak = (needed: number) => {
        if (yPos + needed > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      // Background
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      addText("SOLPRIVACY", 24, [20, 241, 149], true);
      addText("Wallet Privacy Analysis Report", 12, [148, 163, 184]);
      yPos += 5;
      addLine();
      yPos += 5;

      // Wallet Address
      addText("Wallet Address", 10, [148, 163, 184]);
      addText(data.address, 11, [255, 255, 255], true);
      yPos += 5;

      // Privacy Score
      checkPageBreak(40);
      addText("Privacy Score", 10, [148, 163, 184]);
      const gradeColor = getGradeColor(data.grade);
      addText(`${data.advancedPrivacyScore}/100`, 28, gradeColor, true);
      addText(`Grade: ${data.grade} | Risk Level: ${data.riskLevel}`, 12, gradeColor);
      yPos += 10;
      addLine();
      yPos += 5;

      // Attack Simulation
      checkPageBreak(60);
      addText("Attack Simulation Results", 14, [255, 255, 255], true);
      yPos += 3;

      data.attackSimulation.scenarios.forEach((scenario) => {
        checkPageBreak(15);
        const prob = (scenario.probability * 100).toFixed(0);
        const color: [number, number, number] = scenario.probability >= 0.7 ? [239, 68, 68] :
                       scenario.probability >= 0.4 ? [245, 158, 11] : [34, 197, 94];
        pdf.setFontSize(10);
        pdf.setTextColor(...color);
        pdf.text(`${prob}%`, margin, yPos);
        pdf.setTextColor(255, 255, 255);
        pdf.text(scenario.name, margin + 15, yPos);
        yPos += 6;
      });

      yPos += 5;
      addLine();
      yPos += 5;

      // Key Metrics
      checkPageBreak(50);
      addText("Key Privacy Metrics", 14, [255, 255, 255], true);
      yPos += 3;

      const metrics = [
        { label: "Total Entropy", value: data.entropy.totalEntropy.toFixed(3) },
        { label: "K-Anonymity", value: data.kAnonymity.kValue.toString() },
        { label: "Exchange Exposure", value: `${(data.exchangeFingerprint.kycExposure * 100).toFixed(0)}%` },
        { label: "Dust Vulnerability", value: `${(data.dustAttack.dustVulnerability * 100).toFixed(0)}%` },
        { label: "Estimated Timezone", value: data.temporalAnalysis.estimatedTimezone },
        { label: "Timezone Confidence", value: `${(data.temporalAnalysis.timezoneConfidence * 100).toFixed(0)}%` },
      ];

      metrics.forEach((metric) => {
        checkPageBreak(10);
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(metric.label + ":", margin, yPos);
        pdf.setTextColor(255, 255, 255);
        pdf.text(metric.value, margin + 50, yPos);
        yPos += 6;
      });

      yPos += 5;
      addLine();
      yPos += 5;

      // Recommendations
      checkPageBreak(40);
      addText("Recommendations", 14, [255, 255, 255], true);
      yPos += 3;

      data.recommendations.slice(0, 5).forEach((rec) => {
        checkPageBreak(15);
        const priorityColor: [number, number, number] = rec.priority === "HIGH" ? [239, 68, 68] :
                              rec.priority === "MEDIUM" ? [245, 158, 11] : [34, 197, 94];
        pdf.setFontSize(9);
        pdf.setTextColor(...priorityColor);
        pdf.text(`[${rec.priority}]`, margin, yPos);
        pdf.setTextColor(255, 255, 255);
        const actionText = pdf.splitTextToSize(rec.action, pageWidth - margin * 2 - 25);
        pdf.text(actionText, margin + 25, yPos);
        yPos += actionText.length * 5 + 3;
      });

      yPos += 5;
      addLine();
      yPos += 5;

      // Footer
      checkPageBreak(20);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated by SolPrivacy - ${new Date().toISOString().split("T")[0]}`, margin, yPos);
      yPos += 4;
      pdf.text("https://solprivacy.xyz", margin, yPos);

      // Save
      const filename = `solprivacy-report-${data.address.slice(0, 8)}.pdf`;
      pdf.save(filename);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center mb-6"
    >
      <Button
        onClick={exportToPDF}
        disabled={isExporting}
        variant="outline"
        className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
      >
        {isExporting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Generating PDF...
          </>
        ) : exported ? (
          <>
            <Check className="text-success" size={16} />
            Downloaded!
          </>
        ) : (
          <>
            <FileDown size={16} />
            Export Report (PDF)
          </>
        )}
      </Button>
    </motion.div>
  );
}
