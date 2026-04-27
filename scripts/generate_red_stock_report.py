from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.barcharts import VerticalBarChart


OUT = "/Users/lane/Documents/New project/output/pdf/red_watchlist_report_2026-04-21.pdf"


def register_fonts():
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCN",
            parent=styles["Title"],
            fontName="STSong-Light",
            fontSize=20,
            leading=26,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#12324a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubCN",
            parent=styles["Normal"],
            fontName="STSong-Light",
            fontSize=10.5,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#5b6b79"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1CN",
            parent=styles["Heading1"],
            fontName="STSong-Light",
            fontSize=14,
            leading=20,
            textColor=colors.HexColor("#163a59"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCN",
            parent=styles["BodyText"],
            fontName="STSong-Light",
            fontSize=10.5,
            leading=16,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#1f2933"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallCN",
            parent=styles["BodyText"],
            fontName="STSong-Light",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#52606d"),
        )
    )
    return styles


COMPANIES = [
    {
        "name": "宁德时代",
        "tickers": "300750 / HK3750",
        "moves": [3.49, 4.56],
        "table": "A股 447.60元，+3.49%；H股 734.50港元，+4.56%。",
        "analysis": (
            "今天A/H两地同步走强，属于明显的业绩驱动型强势。盘面上，资金更愿意围绕"
            "动力电池龙头和储能景气度做加仓，说明市场把近期一季报高增长和储能占比提升"
            "视为短期核心催化。短线角度，强势没有破坏，但连续冲高后更容易进入高位震荡，"
            "后续要重点看量能能否继续维持。"
        ),
        "comment": (
            "截至4月21日闭市后，我检索到的最新公开观点集中在4月16日至4月18日。"
            "东莞证券、东吴证券和开源证券的最新点评共同指向：一季度营收和利润增速接近"
            "50%，动力和储能双线放量，储能占比继续上升，龙头份额与盈利韧性仍强。"
        ),
        "sources": [
            ("新浪财经", "https://stock.finance.sina.com.cn/stock/go.php/vReport_Show/kind/search/rptid/829673563931/index.phtml"),
            ("中财网", "https://www.cfi.net.cn/p20260417000174.html"),
        ],
    },
    {
        "name": "比亚迪",
        "tickers": "002594 / HK1211",
        "moves": [-1.34, -1.00],
        "table": "A股 101.53元，-1.34%；H股 108.90港元，-1.00%。",
        "analysis": (
            "今天A/H两地都是回调，说明市场更偏向在前期反弹后做利润兑现。A股跌幅略大于H股，"
            "反映内资情绪相对谨慎，但并没有出现单边失速。盘面理解上，这更像是基本面偏强、"
            "股价短线进入整理，而不是趋势性走坏。"
        ),
        "comment": (
            "闭市后可检索到的最新公开观点主要集中在4月2日至4月9日。华创证券对比亚迪A股"
            "年报的判断是：国内基本盘仍稳，海外扩张将继续成为核心增长引擎；财联社转引"
            "中信证券4月9日对比亚迪股份的观点则强调，出口和储能可能继续贡献盈利弹性。"
        ),
        "sources": [
            ("新浪财经", "https://stock.finance.sina.com.cn/stock/go.php/vReport_Show/kind/lastest/rptid/828411004908/index.phtml"),
            ("财联社", "https://www.cls.cn/detail/2338821"),
            ("投资者关系记录", "https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12061745&stockid=002594"),
        ],
    },
    {
        "name": "长江电力",
        "tickers": "600900",
        "moves": [1.08],
        "table": "27.13元，+1.08%。",
        "analysis": (
            "今天走势偏稳健上涨，符合高股息公用事业的防守属性。你这只标红股在今天并不是"
            "情绪冲锋型，而是资金选择偏稳的承接。分时和日线都体现出慢推而非急拉，说明"
            "市场更看重其现金流和股息逻辑。"
        ),
        "comment": (
            "闭市后可检索到的最新公开观点偏向“稳健配置”。富途4月17日的分析师统计显示，"
            "近三个月23位分析师中多数给出强力推荐或买入，平均目标价33.86元；技术面网站"
            "则提示日线短期信号有分歧，意味着中线逻辑稳，但短线不排除震荡消化。"
        ),
        "sources": [
            ("富途分析师评级", "https://www.futunn.com/stock/600900-SH/analysis?from=share"),
            ("英为财情技术面", "https://cn.investing.com/equities/yangtze-power-technical"),
        ],
    },
    {
        "name": "中信证券",
        "tickers": "600030",
        "moves": [0.00],
        "table": "26.30元，0.00%。",
        "analysis": (
            "今天平收，属于典型的强势后横盘消化。券商板块此前已经被一季报预期和成交活跃度"
            "推动过一轮，中信证券作为龙头没有转弱，但也暂时缺少新催化把股价继续往上拔。"
            "这种形态通常意味着市场在等新的成交数据或政策线索。"
        ),
        "comment": (
            "闭市后能检索到的最新公开观点主要集中在4月1日至4月10日。多家机构判断一季度"
            "利润同比大增，投行业务、经纪业务和国际化布局仍是核心看点。若后续市场成交额"
            "继续维持高位，这类龙头券商仍然容易得到资金回流。"
        ),
        "sources": [
            ("每经网", "https://www.nbd.com.cn/articles/2026-04-10/4333308.html"),
            ("新浪财经", "https://finance.sina.com.cn/stock/relnews/cn/2026-04-01/doc-inhsynca1856027.shtml"),
            ("英为财情技术面", "https://cn.investing.com/equities/citic-technical"),
        ],
    },
    {
        "name": "阿里巴巴-W",
        "tickers": "HK9988",
        "moves": [-0.36],
        "table": "136.50港元，-0.36%。",
        "analysis": (
            "今天属于小幅回调，更像等待业绩和云业务验证前的观望。跌幅不大，说明抛压并不极端；"
            "但股价没有重新转强，说明资金对短期业绩兑现和即时零售投入的分歧仍在。整体仍是"
            "偏基本面交易，而非单纯情绪杀跌。"
        ),
        "comment": (
            "截至4月21日闭市后，最新公开机构评论里可见度最高的是花旗4月9日的更新："
            "维持买入评级，并把目标价上调至204港元。核心逻辑是云业务增长有望继续加速，"
            "同时淘宝闪购亏损收敛速度快于预期。"
        ),
        "sources": [
            ("新浪财经", "https://finance.sina.com.cn/stock/hkstock/hkgg/2026-04-09/doc-inhtwtez5871633.shtml"),
            ("证券之星", "https://hk.stockstar.com/RB2026040900018678.shtml"),
        ],
    },
]


def add_header(elements, styles):
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph("同花顺红名自选股日报", styles["TitleCN"]))
    elements.append(Spacer(1, 2 * mm))
    elements.append(
        Paragraph(
            "日期：2026-04-21（闭市后整理）<br/>"
            "说明：名单按当前同花顺截图中可明确识别的“名称被手工标记为红色”的个股保守筛选，"
            "并将同一公司A/H两地股票合并解读。",
            styles["SubCN"],
        )
    )
    elements.append(Spacer(1, 6 * mm))


def add_summary_table(elements, styles):
    data = [
        [
            Paragraph("公司", styles["SmallCN"]),
            Paragraph("代码", styles["SmallCN"]),
            Paragraph("今日表现", styles["SmallCN"]),
            Paragraph("一句话结论", styles["SmallCN"]),
        ]
    ]
    conclusions = {
        "宁德时代": "A/H同步强势，景气交易延续。",
        "比亚迪": "A/H同步整理，偏技术性回撤。",
        "长江电力": "防守品种走稳，资金承接平顺。",
        "中信证券": "平收消化，等待板块新催化。",
        "阿里巴巴-W": "小幅回撤，继续等云业务兑现。",
    }
    for item in COMPANIES:
        data.append(
            [
                Paragraph(item["name"], styles["SmallCN"]),
                Paragraph(item["tickers"], styles["SmallCN"]),
                Paragraph(item["table"], styles["SmallCN"]),
                Paragraph(conclusions[item["name"]], styles["SmallCN"]),
            ]
        )

    table = Table(data, colWidths=[28 * mm, 34 * mm, 40 * mm, 76 * mm])
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "STSong-Light"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.8),
                ("LEADING", (0, 0), (-1, -1), 11),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d9e8f5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#12324a")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#b8c7d1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fbfd")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    elements.append(Paragraph("一、红名股总览", styles["H1CN"]))
    elements.append(table)
    elements.append(Spacer(1, 7 * mm))


def add_bar_chart(elements, styles):
    labels = ["宁德A", "宁德H", "比亚迪A", "比亚迪H", "长江", "中信", "阿里"]
    values = [[3.49, 4.56, -1.34, -1.00, 1.08, 0.00, -0.36]]
    drawing = Drawing(180 * mm, 75 * mm)
    chart = VerticalBarChart()
    chart.x = 18
    chart.y = 22
    chart.height = 145
    chart.width = 470
    chart.data = values
    chart.categoryAxis.categoryNames = labels
    chart.categoryAxis.labels.fontName = "STSong-Light"
    chart.categoryAxis.labels.fontSize = 8
    chart.valueAxis.valueMin = -2
    chart.valueAxis.valueMax = 5
    chart.valueAxis.valueStep = 1
    chart.valueAxis.labels.fontName = "STSong-Light"
    chart.valueAxis.labels.fontSize = 8
    chart.bars[0].fillColor = colors.HexColor("#d84a4a")
    chart.strokeColor = colors.HexColor("#8aa0b3")
    chart.categoryAxis.strokeColor = colors.HexColor("#8aa0b3")
    chart.valueAxis.strokeColor = colors.HexColor("#8aa0b3")
    drawing.add(chart)
    drawing.add(String(190, 172, "今日涨跌幅对比（%）", fontName="STSong-Light", fontSize=11, fillColor=colors.HexColor("#12324a")))
    elements.append(Paragraph("二、今日表现图示", styles["H1CN"]))
    elements.append(drawing)
    elements.append(Spacer(1, 5 * mm))
    elements.append(
        Paragraph(
            "这张图能直接看出，今天最强的是宁德时代A/H双线联动；最弱的是比亚迪A/H双线回调；"
            "长江电力偏稳，中信证券横盘，阿里巴巴-W轻微回落。",
            styles["BodyCN"],
        )
    )
    elements.append(Spacer(1, 8 * mm))


def add_company_pages(elements, styles):
    elements.append(Paragraph("三、逐只走势与最新公开点评", styles["H1CN"]))
    for idx, item in enumerate(COMPANIES, start=1):
        elements.append(Paragraph(f"{idx}. {item['name']}（{item['tickers']}）", styles["H1CN"]))
        elements.append(Paragraph(f"<b>今日收盘表现：</b>{item['table']}", styles["BodyCN"]))
        elements.append(Spacer(1, 1.5 * mm))
        elements.append(Paragraph(f"<b>今日走势分析：</b>{item['analysis']}", styles["BodyCN"]))
        elements.append(Spacer(1, 1.5 * mm))
        elements.append(Paragraph(f"<b>闭市后最新公开股评/机构观点：</b>{item['comment']}", styles["BodyCN"]))
        elements.append(Spacer(1, 1.5 * mm))
        source_lines = "<br/>".join([f"- {name}：{url}" for name, url in item["sources"]])
        elements.append(Paragraph(f"<b>来源：</b><br/>{source_lines}", styles["SmallCN"]))
        elements.append(Spacer(1, 6 * mm))


def add_tail(elements, styles):
    elements.append(PageBreak())
    elements.append(Paragraph("四、结论与使用提示", styles["H1CN"]))
    elements.append(
        Paragraph(
            "1. 今天最强的红名标记股仍然是宁德时代，A/H两地都体现出“业绩+景气度”的资金偏好。<br/>"
            "2. 比亚迪今天是整理，不是失速；如果后续有销量或新车催化，修复弹性仍在。<br/>"
            "3. 长江电力和中信证券更像配置型仓位，一个偏防守，一个偏等待券商板块再启动。<br/>"
            "4. 阿里巴巴-W短线分歧仍在，但最新公开机构观点整体仍偏积极。<br/>"
            "5. 闭市后我未能为每只股票都检索到4月21日当天的新研报，因此报告采用的是“截至4月21日闭市后能公开检索到的最新评论”，并在各节写明时间范围。",
            styles["BodyCN"],
        )
    )
    elements.append(Spacer(1, 8 * mm))
    elements.append(
        Paragraph(
            "风险提示：本报告仅做信息整理，不构成买卖建议；截图识别名单基于当前可见同花顺页面的保守筛选结果。",
            styles["SmallCN"],
        )
    )


def main():
    register_fonts()
    styles = build_styles()
    doc = SimpleDocTemplate(
        OUT,
        pagesize=A4,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
    )
    elements = []
    add_header(elements, styles)
    add_summary_table(elements, styles)
    add_bar_chart(elements, styles)
    add_company_pages(elements, styles)
    add_tail(elements, styles)
    doc.build(elements)
    print(OUT)


if __name__ == "__main__":
    main()
