# doc_builder_engine.py
# High-Fidelity Academic Report Generator for UrbanFlow AI (>60 Pages PDF & DOCX)

import os
import sys
import shutil
import re

# ReportLab imports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Docx imports
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# Import content modules
import doc_builder_content as meta
import doc_content_ch1_ch2 as ch12
import doc_content_ch3 as ch3
import doc_content_ch4 as ch4
import doc_content_ch5_ch6_ch7 as ch567

print("Loaded all content modules successfully.")

PDF_OUTPUT = r"c:\Traffic analytical system\UrbanFlow_AI_Traffic_System_Project_Report.pdf"
DOCX_OUTPUT = r"c:\Traffic analytical system\UrbanFlow_AI_Traffic_System_Project_Report.docx"
ASSETS_DIR = r"c:\Traffic analytical system\doc_assets"
DOWNLOADS_DIR = r"C:\Users\PRADEEPKUMAR M\Downloads"

# -------------------------------------------------------------
# 1. REPORTLAB NUMBERED CANVAS (Prelims Roman, Chapters Arabic)
# -------------------------------------------------------------
class FullNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return # Cover page: no header/footer

        self.saveState()
        self.setFont("Times-Roman", 10)

        # Prelim pages (2 to 9) get Roman numerals
        roman_map = {2: 'ii', 3: 'iii', 4: 'iv', 5: 'v', 6: 'vi', 7: 'vii', 8: 'viii', 9: 'ix'}
        if self._pageNumber in roman_map:
            page_text = roman_map[self._pageNumber]
            self.drawRightString(612 - 54, 792 - 36, page_text)
        else:
            # Regular numbering starting at Chapter 1
            # Adjust so Chapter 1 starts on page 1
            page_num_val = self._pageNumber - 9
            if page_num_val > 0:
                self.drawRightString(612 - 54, 792 - 36, str(page_num_val))

        self.restoreState()


# -------------------------------------------------------------
# 2. REPORTLAB BUILDER FUNCTION
# -------------------------------------------------------------
def build_pdf_report():
    print("--- BUILDING PDF REPORT ---")
    doc = SimpleDocTemplate(
        PDF_OUTPUT,
        pagesize=letter,
        leftMargin=72,  # 1 inch
        rightMargin=54, # 0.75 inch
        topMargin=54,   # 0.75 inch
        bottomMargin=54 # 0.75 inch
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('CoverTitle', parent=styles['Normal'], fontName='Times-Bold', fontSize=13.5, leading=19, alignment=1)
    bold_center = ParagraphStyle('BoldCenter', parent=styles['Normal'], fontName='Times-Bold', fontSize=11, leading=15, alignment=1)
    normal_center = ParagraphStyle('NormalCenter', parent=styles['Normal'], fontName='Times-Roman', fontSize=10.5, leading=14.5, alignment=1)
    sub_style = ParagraphStyle('CoverSub', parent=styles['Normal'], fontName='Times-Roman', fontSize=10.5, leading=14, alignment=1)
    
    ch_title = ParagraphStyle('ChTitle', parent=styles['Normal'], fontName='Times-Bold', fontSize=14, leading=18, alignment=1, spaceAfter=14)
    h1_left = ParagraphStyle('H1Left', parent=styles['Normal'], fontName='Times-Bold', fontSize=12, leading=16, spaceBefore=12, spaceAfter=6, keepWithNext=True)
    h2_left = ParagraphStyle('H2Left', parent=styles['Normal'], fontName='Times-Bold', fontSize=11, leading=14.5, spaceBefore=9, spaceAfter=4, keepWithNext=True)
    body = ParagraphStyle('BodyCustom', parent=styles['Normal'], fontName='Times-Roman', fontSize=10, leading=14.5, alignment=4, spaceAfter=7)
    bullet = ParagraphStyle('BulletCustom', parent=styles['Normal'], fontName='Times-Roman', fontSize=10, leading=14, leftIndent=16, spaceAfter=5)
    caption_style = ParagraphStyle('Caption', parent=styles['Normal'], fontName='Times-Bold', fontSize=9.5, leading=13, alignment=1, spaceBefore=6, spaceAfter=10)
    code_text = ParagraphStyle('CodeText', parent=styles['Normal'], fontName='Courier', fontSize=7.2, leading=9.6, textColor=colors.HexColor('#0f172a'))
    table_cell = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Times-Roman', fontSize=8.5, leading=11)
    table_header = ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Times-Bold', fontSize=9, leading=12, textColor=colors.white)

    story = []

    # ---------------- PAGE 1: COVER PAGE ----------------
    story.append(Paragraph(meta.METADATA["project_title"], title_style))
    story.append(Spacer(1, 14))
    story.append(Paragraph("A PROJECT REPORT", bold_center))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Submitted by", sub_style))
    story.append(Spacer(1, 8))
    for s in meta.METADATA["students"]:
        story.append(Paragraph(f"{s['name']} ({s['reg_no']})", bold_center))
    story.append(Spacer(1, 12))
    story.append(Paragraph("in partial fulfillment for the award of the degree of", sub_style))
    story.append(Spacer(1, 8))
    for line in meta.METADATA["degree"].split("\n"):
        story.append(Paragraph(line, bold_center))
    story.append(Spacer(1, 16))

    # College logo
    logo1 = os.path.join(ASSETS_DIR, "image1.png")
    if os.path.exists(logo1):
        story.append(Image(logo1, width=1.1*72, height=1.05*72))
    story.append(Spacer(1, 16))

    for line in meta.METADATA["college"].split("\n"):
        story.append(Paragraph(line, bold_center))
    story.append(Spacer(1, 12))
    story.append(Paragraph(meta.METADATA["session"], bold_center))
    story.append(PageBreak())

    # ---------------- PAGE 2: BONAFIDE CERTIFICATE ----------------
    story.append(Paragraph("BONAFIDE CERTIFICATE", ch_title))
    story.append(Spacer(1, 14))
    for p in meta.BONAFIDE_PARAGRAPHS:
        story.append(Paragraph(p, body))
        story.append(Spacer(1, 10))

    story.append(Spacer(1, 30))
    
    # Signature table
    sig_data = [
        [
            Paragraph(f"<b>SIGNATURE</b><br/><br/><br/><b>{meta.METADATA['supervisor']['name']}</b><br/>{meta.METADATA['supervisor']['designation']}<br/>{meta.METADATA['supervisor']['department']}<br/>{meta.METADATA['supervisor']['institution']}", table_cell),
            Paragraph(f"<b>SIGNATURE</b><br/><br/><br/><b>{meta.METADATA['hod']['name']}</b><br/>{meta.METADATA['hod']['designation']}<br/>{meta.METADATA['hod']['department']}<br/>{meta.METADATA['hod']['institution']}", table_cell)
        ]
    ]
    sig_table = Table(sig_data, colWidths=[240, 240])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(sig_table)

    story.append(Spacer(1, 40))
    viva_data = [
        [
            Paragraph("<b>INTERNAL EXAMINER</b><br/><br/><br/>Signature with Date", table_cell),
            Paragraph("<b>EXTERNAL EXAMINER</b><br/><br/><br/>Signature with Date", table_cell)
        ]
    ]
    viva_table = Table(viva_data, colWidths=[240, 240])
    viva_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(viva_table)
    story.append(PageBreak())

    # ---------------- PAGE 3 & 4: ABSTRACT ----------------
    story.append(Paragraph("ABSTRACT", ch_title))
    story.append(Spacer(1, 12))
    story.append(Paragraph(meta.ABSTRACT_PARAGRAPHS[0], body))
    story.append(Paragraph(meta.ABSTRACT_PARAGRAPHS[1], body))
    story.append(PageBreak())
    
    story.append(Paragraph("ABSTRACT (CONTINUED)", ch_title))
    story.append(Spacer(1, 12))
    story.append(Paragraph(meta.ABSTRACT_PARAGRAPHS[2], body))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<b>{meta.ABSTRACT_PARAGRAPHS[3]}</b>", body))
    story.append(PageBreak())

    # ---------------- PAGE 5: ACKNOWLEDGEMENT ----------------
    story.append(Paragraph("ACKNOWLEDGEMENT", ch_title))
    story.append(Spacer(1, 12))
    for p in meta.ACKNOWLEDGEMENT_PARAGRAPHS:
        story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- PAGE 6 & 7: TABLE OF CONTENTS ----------------
    story.append(Paragraph("TABLE OF CONTENTS", ch_title))
    story.append(Spacer(1, 8))
    
    # Split TOC into two pages
    toc_half = len(meta.TABLE_OF_CONTENTS_DATA) // 2
    toc_p1 = meta.TABLE_OF_CONTENTS_DATA[:toc_half]
    toc_p2 = meta.TABLE_OF_CONTENTS_DATA[toc_half:]

    def make_toc_table(items):
        t_data = [[Paragraph("<b>CHAPTER NO. / TITLE</b>", table_header), Paragraph("<b>PAGE NO.</b>", table_header)]]
        for title, pg in items:
            t_data.append([Paragraph(title, table_cell), Paragraph(str(pg), table_cell)])
        t = Table(t_data, colWidths=[400, 80])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        return t

    story.append(make_toc_table(toc_p1))
    story.append(PageBreak())

    story.append(Paragraph("TABLE OF CONTENTS (CONTINUED)", ch_title))
    story.append(Spacer(1, 8))
    story.append(make_toc_table(toc_p2))
    story.append(PageBreak())

    # ---------------- PAGE 8: LIST OF TABLES ----------------
    story.append(Paragraph("LIST OF TABLES", ch_title))
    story.append(Spacer(1, 8))
    lot_data = [[Paragraph("<b>TABLE NO.</b>", table_header), Paragraph("<b>TITLE</b>", table_header), Paragraph("<b>PAGE NO.</b>", table_header)]]
    for num, title, pg in meta.LIST_OF_TABLES_DATA:
        lot_data.append([Paragraph(num, table_cell), Paragraph(title, table_cell), Paragraph(str(pg), table_cell)])
    lot_table = Table(lot_data, colWidths=[90, 310, 80])
    lot_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(lot_table)
    story.append(PageBreak())

    # ---------------- PAGE 9: LIST OF FIGURES ----------------
    story.append(Paragraph("LIST OF FIGURES", ch_title))
    story.append(Spacer(1, 8))
    lof_data = [[Paragraph("<b>FIGURE NO.</b>", table_header), Paragraph("<b>TITLE</b>", table_header), Paragraph("<b>PAGE NO.</b>", table_header)]]
    for num, title, pg in meta.LIST_OF_FIGURES_DATA:
        lof_data.append([Paragraph(num, table_cell), Paragraph(title, table_cell), Paragraph(str(pg), table_cell)])
    lof_table = Table(lof_data, colWidths=[90, 310, 80])
    lof_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(lof_table)
    story.append(PageBreak())

    # ---------------- CHAPTER 1: INTRODUCTION ----------------
    story.append(Paragraph(ch12.CH1_TITLE, ch_title))
    story.append(Spacer(1, 10))
    for sec in ch12.CH1_SECTIONS:
        story.append(Paragraph(sec["heading"], h1_left))
        for p in sec["paragraphs"]:
            if p.startswith("(") and p[2:4] in [") ", ". "]:
                story.append(Paragraph(p, bullet))
            else:
                story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- CHAPTER 2: LITERATURE REVIEW ----------------
    story.append(Paragraph(ch12.CH2_TITLE, ch_title))
    story.append(Spacer(1, 10))
    for sec in ch12.CH2_SECTIONS:
        story.append(Paragraph(sec["heading"], h1_left))
        for p in sec["paragraphs"]:
            if p.startswith("- ") or (p.startswith("(") and len(p) > 3 and p[2] == ')'):
                story.append(Paragraph(p, bullet))
            else:
                story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- CHAPTER 3: SYSTEM DESIGN ----------------
    story.append(Paragraph(ch3.CH3_TITLE, ch_title))
    story.append(Spacer(1, 10))

    def make_table_3(headers, rows, widths):
        t_data = [[Paragraph(f"<b>{h}</b>", table_header) for h in headers]]
        for r in rows:
            t_data.append([Paragraph(cell, table_cell) for cell in r])
        t = Table(t_data, colWidths=widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        return t

    for sec in ch3.CH3_SECTIONS:
        story.append(Paragraph(sec["heading"], h1_left))
        for p in sec["paragraphs"]:
            if p == "[FIGURE_3_1_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_architecture.png")
                if os.path.exists(fig_p):
                    story.append(Image(fig_p, width=460, height=270))
                    story.append(Paragraph("Figure 3.1: UrbanFlow AI High-Level System Architecture and Data Pipelines", caption_style))
            elif p == "[FIGURE_3_2_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_pedestrian_actuation.png")
                if os.path.exists(fig_p):
                    story.append(Image(fig_p, width=460, height=245))
                    story.append(Paragraph("Figure 3.2: Pedestrian Crosswalk Actuation Sequence and Safety Hold Protocol", caption_style))
            elif p == "[FIGURE_3_3_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_er_schema.png")
                if os.path.exists(fig_p):
                    story.append(Image(fig_p, width=460, height=270))
                    story.append(Paragraph("Figure 3.3: In-Memory Relational Schema and Entity-Relationship Architecture", caption_style))
            elif p == "[TABLE_3_1_PLACEHOLDER]":
                story.append(Paragraph("Table 3.1: Relational Attribute Schema for In-Memory Vehicle Entities", caption_style))
                story.append(make_table_3(["Field Name", "Data Type", "Constraint", "Functional Semantic Description"], ch3.TABLE_3_1_ROWS, [90, 85, 95, 210]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_3_2_PLACEHOLDER]":
                story.append(Paragraph("Table 3.2: Signal Phase State Configuration and Transition Thresholds", caption_style))
                story.append(make_table_3(["Field Name", "Data Type", "Constraint", "Operational Control Significance"], ch3.TABLE_3_2_ROWS, [95, 80, 95, 210]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_3_3_PLACEHOLDER]":
                story.append(Paragraph("Table 3.3: Electronic Violation Ledger (E-Challan) Data Schema", caption_style))
                story.append(make_table_3(["Field Name", "Data Type", "Constraint", "Statutory Enforcement Purpose"], ch3.TABLE_3_3_ROWS, [95, 90, 110, 185]))
                story.append(Spacer(1, 6))
            elif p.startswith("- ") or (p.startswith("(") and len(p) > 3 and p[2] == ')'):
                story.append(Paragraph(p, bullet))
            else:
                story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- CHAPTER 4: IMPLEMENTATION & SOURCE CODE ----------------
    story.append(Paragraph(ch4.CH4_TITLE, ch_title))
    story.append(Spacer(1, 10))
    for p in ch4.CH4_INTRO:
        story.append(Paragraph(p, body))
    story.append(Spacer(1, 6))

    def make_code_box(code_str):
        # Format code lines into monospace blocks of at most 35 lines each so ReportLab can paginate cleanly
        lines = [line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for line in code_str.split("\n")]
        chunk_size = 35
        flowables = []
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i:i + chunk_size]
            formatted_code = "<br/>".join(chunk_lines)
            p = Paragraph(formatted_code, code_text)
            t = Table([[p]], colWidths=[480])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ]))
            flowables.append(t)
            flowables.append(Spacer(1, 4))
        return flowables

    for mod in ch4.CH4_MODULES:
        story.append(Paragraph(mod["title"], h1_left))
        story.append(Paragraph(mod["description"], body))
        
        # If there are text paragraphs
        if "text" in mod:
            for p in mod["text"]:
                story.append(Paragraph(p, body))
        
        # If there is a file, read and insert code
        if "file" in mod:
            raw_code = ch4.read_java_file(mod["file"])
            # Truncate to clean 90 lines if long to keep pages balanced
            code_lines = raw_code.split("\n")
            if len(code_lines) > 110:
                display_code = "\n".join(code_lines[:110]) + "\n\n// ... [Additional production methods encapsulated in java_system] ..."
            else:
                display_code = raw_code
            story.extend(make_code_box(display_code))
            story.append(Spacer(1, 4))

        # Technical walkthrough
        if "walkthrough" in mod:
            for item in mod["walkthrough"]:
                if item.startswith("- "):
                    story.append(Paragraph(item, bullet))
                else:
                    story.append(Paragraph(f"<b>{item}</b>", body))
            story.append(Spacer(1, 8))

    story.append(PageBreak())

    # ---------------- CHAPTER 5: RESULTS & DISCUSSION ----------------
    story.append(Paragraph(ch567.CH5_TITLE, ch_title))
    story.append(Spacer(1, 10))

    def make_table_5(headers, rows, widths):
        t_data = [[Paragraph(f"<b>{h}</b>", table_header) for h in headers]]
        for r in rows:
            t_data.append([Paragraph(cell, table_cell) for cell in r])
        t = Table(t_data, colWidths=widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        return t

    for sec in ch567.CH5_SECTIONS:
        story.append(Paragraph(sec["heading"], h1_left))
        for p in sec["paragraphs"]:
            if p == "[TABLE_5_1_PLACEHOLDER]":
                story.append(Paragraph("Table 5.1: Unit and Functional Test Execution Matrix", caption_style))
                story.append(make_table_5(["Test ID", "Functional Module / Test Case", "Test Input / Boundary Condition", "Expected Operational Outcome", "Status"], ch567.TABLE_5_1_ROWS, [50, 125, 135, 125, 45]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_5_2_PLACEHOLDER]":
                story.append(Paragraph("Table 5.2: Boundary, Edge-Case and Stress Testing Results", caption_style))
                story.append(make_table_5(["Test ID", "Stress Scenario / Edge Case", "Extreme Test Input Condition", "Observed System Behavior", "Status"], ch567.TABLE_5_2_ROWS, [50, 125, 135, 125, 45]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_5_3_PLACEHOLDER]":
                story.append(Paragraph("Table 5.3: Security, Fail-Safe Recovery and Preemption Verification", caption_style))
                story.append(make_table_5(["Test ID", "Resilience & Security Check", "Failure Mode / Threat Injection", "Verification Result & Handling", "Status"], ch567.TABLE_5_3_ROWS, [50, 125, 135, 125, 45]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_5_4_PLACEHOLDER]":
                story.append(Paragraph("Table 5.4: Baseline Pre-Timed vs. UrbanFlow AI Adaptive Signal Control Benchmark", caption_style))
                story.append(make_table_5(["Performance Evaluation Metric", "Baseline Fixed-Time Control", "UrbanFlow AI Adaptive System", "Observed Empirical Variance"], ch567.TABLE_5_4_ROWS, [145, 105, 115, 115]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_5_5_PLACEHOLDER]":
                story.append(Paragraph("Table 5.5: Pedestrian Crosswalk Safety Interlock Evaluation Metrics", caption_style))
                story.append(make_table_5(["Safety Evaluation Parameter", "Standard Unactuated Crosswalk", "UrbanFlow AI Safety Interlock", "Safety Improvement Margin"], ch567.TABLE_5_5_ROWS, [145, 105, 115, 115]))
                story.append(Spacer(1, 6))
            elif p == "[TABLE_5_6_PLACEHOLDER]":
                story.append(Paragraph("Table 5.6: Emergency Ambulance Preemption Response and Transit Delay Comparison", caption_style))
                story.append(make_table_5(["Preemption Metric Parameter", "Standard Traffic Progression", "UrbanFlow AI Green Wave Preemption", "Transit Efficiency Gain"], ch567.TABLE_5_6_ROWS, [145, 105, 115, 115]))
                story.append(Spacer(1, 6))
            elif p == "[FIGURE_5_1_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_performance_chart.png")
                if os.path.exists(fig_p):
                    story.append(Image(fig_p, width=460, height=185))
                    story.append(Paragraph("Figure 5.1: Empirical Performance Benchmarks (Delay Reduction, Throughput Comparison, Queue Clearance)", caption_style))
            elif p == "[FIGURE_5_2_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_gui_layout.png")
                if os.path.exists(fig_p):
                    story.append(Image(fig_p, width=460, height=270))
                    story.append(Paragraph("Figure 5.2: Java Operations Command Center GUI: Real-Time Simulation Canvas and CCTV HUD Layout", caption_style))
            elif p.startswith("- ") or (p.startswith("(") and len(p) > 3 and p[2] == ')'):
                story.append(Paragraph(p, bullet))
            else:
                story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- CHAPTER 6: CONCLUSION ----------------
    story.append(Paragraph(ch567.CH6_TITLE, ch_title))
    story.append(Spacer(1, 10))
    for sec in ch567.CH6_SECTIONS:
        story.append(Paragraph(sec["heading"], h1_left))
        for p in sec["paragraphs"]:
            if p.startswith("- ") or (p.startswith("(") and len(p) > 3 and p[2] == ')'):
                story.append(Paragraph(p, bullet))
            else:
                story.append(Paragraph(p, body))
        story.append(Spacer(1, 4))
    story.append(PageBreak())

    # ---------------- CHAPTER 7: REFERENCES ----------------
    story.append(Paragraph(ch567.CH7_TITLE, ch_title))
    story.append(Spacer(1, 10))
    for ref in ch567.CH7_REFERENCES:
        story.append(Paragraph(ref, bullet))
        story.append(Spacer(1, 3))

    print("Building canvas...")
    doc.build(story, canvasmaker=FullNumberedCanvas)
    print("PDF build completed.")


# -------------------------------------------------------------
# 3. PYTHON-DOCX BUILDER FUNCTION
# -------------------------------------------------------------
def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def build_docx_report():
    print("--- BUILDING DOCX REPORT ---")
    doc = docx.Document()

    # Set margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(0.75)

    def add_p(text, style='Normal', align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size=Pt(10.5), font='Times New Roman', space_after=Pt(6), line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = space_after
        p.paragraph_format.line_spacing = line_spacing
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = font
        run.font.size = size
        return p

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11.5)
        return p

    # ---------------- COVER PAGE ----------------
    add_p(meta.METADATA["project_title"], align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    add_p("A PROJECT REPORT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(12), space_after=Pt(10))
    add_p("Submitted by", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=Pt(11), space_after=Pt(8))
    for s in meta.METADATA["students"]:
        add_p(f"{s['name']} ({s['reg_no']})", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(11.5), space_after=Pt(4))
    add_p("in partial fulfillment for the award of the degree of", align=WD_ALIGN_PARAGRAPH.CENTER, size=Pt(10.5), space_after=Pt(8))
    for line in meta.METADATA["degree"].split("\n"):
        add_p(line, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(11.5), space_after=Pt(2))
    add_p("", space_after=Pt(12))

    logo1 = os.path.join(ASSETS_DIR, "image1.png")
    if os.path.exists(logo1):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_after = Pt(14)
        p_img.add_run().add_picture(logo1, width=Inches(1.2))

    for line in meta.METADATA["college"].split("\n"):
        add_p(line, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(12), space_after=Pt(3))
    add_p(meta.METADATA["session"], align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(11.5), space_after=Pt(0))
    doc.add_page_break()

    # ---------------- BONAFIDE CERTIFICATE ----------------
    add_p("BONAFIDE CERTIFICATE", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for p in meta.BONAFIDE_PARAGRAPHS:
        add_p(p, size=Pt(11), space_after=Pt(12))
    
    add_p("", space_after=Pt(30))
    # Signature table
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0, c1 = sig_table.rows[0].cells
    c0.width = Inches(3.2)
    c1.width = Inches(3.2)
    c0.paragraphs[0].add_run(f"SIGNATURE\n\n\n\n{meta.METADATA['supervisor']['name']}\n{meta.METADATA['supervisor']['designation']}\n{meta.METADATA['supervisor']['department']}\n{meta.METADATA['supervisor']['institution']}").bold = True
    c1.paragraphs[0].add_run(f"SIGNATURE\n\n\n\n{meta.METADATA['hod']['name']}\n{meta.METADATA['hod']['designation']}\n{meta.METADATA['hod']['department']}\n{meta.METADATA['hod']['institution']}").bold = True

    add_p("", space_after=Pt(36))
    viva_table = doc.add_table(rows=1, cols=2)
    viva_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    v0, v1 = viva_table.rows[0].cells
    v0.width = Inches(3.2)
    v1.width = Inches(3.2)
    v0.paragraphs[0].add_run("INTERNAL EXAMINER\n\n\nSignature with Date").bold = True
    v1.paragraphs[0].add_run("EXTERNAL EXAMINER\n\n\nSignature with Date").bold = True
    doc.add_page_break()

    # ---------------- ABSTRACT ----------------
    add_p("ABSTRACT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for p in meta.ABSTRACT_PARAGRAPHS[:-1]:
        add_p(p, size=Pt(10.5), space_after=Pt(10))
    add_p(meta.ABSTRACT_PARAGRAPHS[-1], bold=True, size=Pt(10.5), space_after=Pt(10))
    doc.add_page_break()

    # ---------------- ACKNOWLEDGEMENT ----------------
    add_p("ACKNOWLEDGEMENT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for p in meta.ACKNOWLEDGEMENT_PARAGRAPHS:
        add_p(p, size=Pt(10.5), space_after=Pt(8))
    doc.add_page_break()

    # ---------------- TABLE OF CONTENTS ----------------
    add_p("TABLE OF CONTENTS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(12))
    toc_table = doc.add_table(rows=1, cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = toc_table.rows[0].cells
    hdr[0].width = Inches(5.2)
    hdr[1].width = Inches(1.2)
    hdr[0].paragraphs[0].add_run("CHAPTER NO. / TITLE").bold = True
    hdr[1].paragraphs[0].add_run("PAGE NO.").bold = True
    set_cell_background(hdr[0], "1E293B")
    set_cell_background(hdr[1], "1E293B")
    hdr[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    hdr[1].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)

    for item, pg in meta.TABLE_OF_CONTENTS_DATA:
        row = toc_table.add_row().cells
        row[0].width = Inches(5.2)
        row[1].width = Inches(1.2)
        row[0].paragraphs[0].add_run(item)
        row[1].paragraphs[0].add_run(str(pg))
        row[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    doc.add_page_break()

    # ---------------- LIST OF TABLES ----------------
    add_p("LIST OF TABLES", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(12))
    lot_table = doc.add_table(rows=1, cols=3)
    lot_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    lhdr = lot_table.rows[0].cells
    lhdr[0].width = Inches(1.2)
    lhdr[1].width = Inches(4.0)
    lhdr[2].width = Inches(1.2)
    lhdr[0].paragraphs[0].add_run("TABLE NO.").bold = True
    lhdr[1].paragraphs[0].add_run("TITLE").bold = True
    lhdr[2].paragraphs[0].add_run("PAGE NO.").bold = True
    for c in lhdr:
        set_cell_background(c, "1E293B")
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    for num, title, pg in meta.LIST_OF_TABLES_DATA:
        row = lot_table.add_row().cells
        row[0].width = Inches(1.2)
        row[1].width = Inches(4.0)
        row[2].width = Inches(1.2)
        row[0].paragraphs[0].add_run(num)
        row[1].paragraphs[0].add_run(title)
        row[2].paragraphs[0].add_run(str(pg))
        row[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    doc.add_page_break()

    # ---------------- LIST OF FIGURES ----------------
    add_p("LIST OF FIGURES", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(12))
    lof_table = doc.add_table(rows=1, cols=3)
    lof_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    fhdr = lof_table.rows[0].cells
    fhdr[0].width = Inches(1.2)
    fhdr[1].width = Inches(4.0)
    fhdr[2].width = Inches(1.2)
    fhdr[0].paragraphs[0].add_run("FIGURE NO.").bold = True
    fhdr[1].paragraphs[0].add_run("TITLE").bold = True
    fhdr[2].paragraphs[0].add_run("PAGE NO.").bold = True
    for c in fhdr:
        set_cell_background(c, "1E293B")
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    for num, title, pg in meta.LIST_OF_FIGURES_DATA:
        row = lof_table.add_row().cells
        row[0].width = Inches(1.2)
        row[1].width = Inches(4.0)
        row[2].width = Inches(1.2)
        row[0].paragraphs[0].add_run(num)
        row[1].paragraphs[0].add_run(title)
        row[2].paragraphs[0].add_run(str(pg))
        row[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    doc.add_page_break()

    # ---------------- CHAPTER 1: INTRODUCTION ----------------
    add_p(ch12.CH1_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for sec in ch12.CH1_SECTIONS:
        add_heading_1(sec["heading"])
        for p in sec["paragraphs"]:
            add_p(p, size=Pt(10.5), space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 2: LITERATURE REVIEW ----------------
    add_p(ch12.CH2_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for sec in ch12.CH2_SECTIONS:
        add_heading_1(sec["heading"])
        for p in sec["paragraphs"]:
            add_p(p, size=Pt(10.5), space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 3: SYSTEM DESIGN ----------------
    add_p(ch3.CH3_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))

    def add_docx_table(headers, rows, widths):
        t = doc.add_table(rows=1, cols=len(headers))
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        hdr_cells = t.rows[0].cells
        for i, h in enumerate(headers):
            hdr_cells[i].width = Inches(widths[i])
            hdr_cells[i].paragraphs[0].add_run(h).bold = True
            set_cell_background(hdr_cells[i], "1E293B")
            hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
            hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(9)
        for r_idx, r in enumerate(rows):
            row_cells = t.add_row().cells
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for i, val in enumerate(r):
                row_cells[i].width = Inches(widths[i])
                row_cells[i].paragraphs[0].add_run(val).font.size = Pt(8.5)
                set_cell_background(row_cells[i], bg)

    for sec in ch3.CH3_SECTIONS:
        add_heading_1(sec["heading"])
        for p in sec["paragraphs"]:
            if p == "[FIGURE_3_1_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_architecture.png")
                if os.path.exists(fig_p):
                    p_img = doc.add_paragraph()
                    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_img.add_run().add_picture(fig_p, width=Inches(6.0))
                    add_p("Figure 3.1: UrbanFlow AI High-Level System Architecture and Data Pipelines", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(8))
            elif p == "[FIGURE_3_2_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_pedestrian_actuation.png")
                if os.path.exists(fig_p):
                    p_img = doc.add_paragraph()
                    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_img.add_run().add_picture(fig_p, width=Inches(6.0))
                    add_p("Figure 3.2: Pedestrian Crosswalk Actuation Sequence and Safety Hold Protocol", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(8))
            elif p == "[FIGURE_3_3_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_er_schema.png")
                if os.path.exists(fig_p):
                    p_img = doc.add_paragraph()
                    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_img.add_run().add_picture(fig_p, width=Inches(6.0))
                    add_p("Figure 3.3: In-Memory Relational Schema and Entity-Relationship Architecture", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(8))
            elif p == "[TABLE_3_1_PLACEHOLDER]":
                add_p("Table 3.1: Relational Attribute Schema for In-Memory Vehicle Entities", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Field Name", "Data Type", "Constraint", "Functional Semantic Description"], ch3.TABLE_3_1_ROWS, [1.2, 1.1, 1.2, 2.9])
            elif p == "[TABLE_3_2_PLACEHOLDER]":
                add_p("Table 3.2: Signal Phase State Configuration and Transition Thresholds", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Field Name", "Data Type", "Constraint", "Operational Control Significance"], ch3.TABLE_3_2_ROWS, [1.2, 1.1, 1.2, 2.9])
            elif p == "[TABLE_3_3_PLACEHOLDER]":
                add_p("Table 3.3: Electronic Violation Ledger (E-Challan) Data Schema", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Field Name", "Data Type", "Constraint", "Statutory Enforcement Purpose"], ch3.TABLE_3_3_ROWS, [1.2, 1.1, 1.4, 2.7])
            else:
                add_p(p, size=Pt(10.5), space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 4: IMPLEMENTATION & CODE ----------------
    add_p(ch4.CH4_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for p in ch4.CH4_INTRO:
        add_p(p, size=Pt(10.5), space_after=Pt(6))

    def add_docx_code_box(code_str):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.rows[0].cells[0]
        cell.width = Inches(6.4)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.05
        run = p.add_run(code_str)
        run.font.name = 'Courier New'
        run.font.size = Pt(7.5)
        run.font.color.rgb = RGBColor(15, 23, 42)

    for mod in ch4.CH4_MODULES:
        add_heading_1(mod["title"])
        add_p(mod["description"], size=Pt(10.5), space_after=Pt(6))
        if "text" in mod:
            for p in mod["text"]:
                add_p(p, size=Pt(10.5), space_after=Pt(6))
        if "file" in mod:
            raw_code = ch4.read_java_file(mod["file"])
            code_lines = raw_code.split("\n")
            if len(code_lines) > 110:
                display_code = "\n".join(code_lines[:110]) + "\n\n// ... [Additional production methods encapsulated in java_system] ..."
            else:
                display_code = raw_code
            add_docx_code_box(display_code)
            add_p("", space_after=Pt(4))
        if "walkthrough" in mod:
            for item in mod["walkthrough"]:
                if item.startswith("- "):
                    add_p(item, size=Pt(10), space_after=Pt(4))
                else:
                    add_p(item, bold=True, size=Pt(10.5), space_after=Pt(5))
            add_p("", space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 5: RESULTS & DISCUSSION ----------------
    add_p(ch567.CH5_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for sec in ch567.CH5_SECTIONS:
        add_heading_1(sec["heading"])
        for p in sec["paragraphs"]:
            if p == "[TABLE_5_1_PLACEHOLDER]":
                add_p("Table 5.1: Unit and Functional Test Execution Matrix", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Test ID", "Functional Module / Test Case", "Test Input / Boundary Condition", "Expected Operational Outcome", "Status"], ch567.TABLE_5_1_ROWS, [0.7, 1.7, 1.7, 1.7, 0.6])
            elif p == "[TABLE_5_2_PLACEHOLDER]":
                add_p("Table 5.2: Boundary, Edge-Case and Stress Testing Results", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Test ID", "Stress Scenario / Edge Case", "Extreme Test Input Condition", "Observed System Behavior", "Status"], ch567.TABLE_5_2_ROWS, [0.7, 1.7, 1.7, 1.7, 0.6])
            elif p == "[TABLE_5_3_PLACEHOLDER]":
                add_p("Table 5.3: Security, Fail-Safe Recovery and Preemption Verification", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Test ID", "Resilience & Security Check", "Failure Mode / Threat Injection", "Verification Result & Handling", "Status"], ch567.TABLE_5_3_ROWS, [0.7, 1.7, 1.7, 1.7, 0.6])
            elif p == "[TABLE_5_4_PLACEHOLDER]":
                add_p("Table 5.4: Baseline Pre-Timed vs. UrbanFlow AI Adaptive Signal Control Benchmark", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Performance Evaluation Metric", "Baseline Fixed-Time Control", "UrbanFlow AI Adaptive System", "Observed Empirical Variance"], ch567.TABLE_5_4_ROWS, [2.0, 1.4, 1.5, 1.5])
            elif p == "[TABLE_5_5_PLACEHOLDER]":
                add_p("Table 5.5: Pedestrian Crosswalk Safety Interlock Evaluation Metrics", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Safety Evaluation Parameter", "Standard Unactuated Crosswalk", "UrbanFlow AI Safety Interlock", "Safety Improvement Margin"], ch567.TABLE_5_5_ROWS, [2.0, 1.4, 1.5, 1.5])
            elif p == "[TABLE_5_6_PLACEHOLDER]":
                add_p("Table 5.6: Emergency Ambulance Preemption Response and Transit Delay Comparison", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(4))
                add_docx_table(["Preemption Metric Parameter", "Standard Traffic Progression", "UrbanFlow AI Green Wave Preemption", "Transit Efficiency Gain"], ch567.TABLE_5_6_ROWS, [2.0, 1.4, 1.5, 1.5])
            elif p == "[FIGURE_5_1_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_performance_chart.png")
                if os.path.exists(fig_p):
                    p_img = doc.add_paragraph()
                    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_img.add_run().add_picture(fig_p, width=Inches(6.0))
                    add_p("Figure 5.1: Empirical Performance Benchmarks (Delay Reduction, Throughput Comparison, Queue Clearance)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(8))
            elif p == "[FIGURE_5_2_PLACEHOLDER]":
                fig_p = os.path.join(ASSETS_DIR, "fig_gui_layout.png")
                if os.path.exists(fig_p):
                    p_img = doc.add_paragraph()
                    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_img.add_run().add_picture(fig_p, width=Inches(6.0))
                    add_p("Figure 5.2: Java Operations Command Center GUI: Real-Time Simulation Canvas and CCTV HUD Layout", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(9.5), space_after=Pt(8))
            else:
                add_p(p, size=Pt(10.5), space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 6: CONCLUSION ----------------
    add_p(ch567.CH6_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for sec in ch567.CH6_SECTIONS:
        add_heading_1(sec["heading"])
        for p in sec["paragraphs"]:
            add_p(p, size=Pt(10.5), space_after=Pt(6))
    doc.add_page_break()

    # ---------------- CHAPTER 7: REFERENCES ----------------
    add_p(ch567.CH7_TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=Pt(14), space_after=Pt(14))
    for ref in ch567.CH7_REFERENCES:
        add_p(ref, size=Pt(9.5), space_after=Pt(4))

    doc.save(DOCX_OUTPUT)
    print("DOCX build completed.")


# -------------------------------------------------------------
# 4. EXECUTION & COPY TO DOWNLOADS
# -------------------------------------------------------------
if __name__ == "__main__":
    build_pdf_report()
    build_docx_report()

    # Copy both files to Downloads folder
    if os.path.exists(DOWNLOADS_DIR):
        shutil.copy2(PDF_OUTPUT, os.path.join(DOWNLOADS_DIR, "UrbanFlow_AI_Traffic_System_Project_Report.pdf"))
        shutil.copy2(DOCX_OUTPUT, os.path.join(DOWNLOADS_DIR, "UrbanFlow_AI_Traffic_System_Project_Report.docx"))
        print(f"Copied both reports to {DOWNLOADS_DIR}")
    else:
        print(f"Downloads dir {DOWNLOADS_DIR} not found.")

    print("ALL BUILD STEPS FINISHED SUCCESSFULLY.")
