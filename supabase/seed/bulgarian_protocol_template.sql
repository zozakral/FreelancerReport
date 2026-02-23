-- Seed: Bulgarian Protocol Template
-- Description: Formal Bulgarian protocol/report template matching official document format
-- Created: 2026-02-23

INSERT INTO report_templates (name, description, template_definition, styles) VALUES (
  'Bulgarian Protocol',
  'Официален български протокол за работно събрание с детайлна agenda и решения',
  '{
    "pageSize": "A4",
    "pageMargins": [60, 60, 60, 80],
    "defaultStyle": {
      "font": "Roboto",
      "fontSize": 10
    },
    "content": [
      {
        "text": "ПРОТОКОЛ",
        "style": "title",
        "alignment": "center",
        "margin": [0, 0, 0, 20]
      },
      {
        "columns": [
          {
            "width": "*",
            "stack": [
              {
                "text": [
                  "от проведено Общо събрание на ",
                  { "text": "{{reportDate}}", "bold": true },
                  " г."
                ]
              },
              {
                "text": [
                  "Зоза ЕООД, ЕИК 206228219 — гр. ",
                  { "text": "{{city}}", "bold": false }
                ],
                "margin": [0, 2, 0, 0]
              }
            ]
          },
          {
            "width": 150,
            "stack": [
              {
                "text": [
                  "Дата: ",
                  { "text": "{{reportDate}}", "bold": false }
                ],
                "alignment": "right"
              },
              {
                "text": [
                  "Място: ",
                  { "text": "{{location}}", "bold": false }
                ],
                "alignment": "right",
                "margin": [0, 2, 0, 0]
              }
            ]
          }
        ],
        "margin": [0, 0, 0, 20]
      },
      {
        "text": [
          "Днес, ",
          { "text": "{{reportDate}}", "bold": false },
          " г., в гр. ",
          { "text": "{{city}}", "bold": false },
          " се проведе Общо събрание, на което бяха представени следните дейности:"
        ],
        "margin": [0, 0, 0, 15],
        "alignment": "justify"
      },
      {
        "text": [
          { "text": "{{workerName}}", "bold": true },
          " - ЕГН ",
          { "text": "{{taxNumber}}", "bold": false },
          ", постоянен адрес: {{location}}, притежаващ 100% от капитала на дружеството."
        ],
        "margin": [0, 0, 0, 20]
      },
      {
        "text": "Дневен ред",
        "style": "sectionHeader",
        "margin": [0, 10, 0, 10]
      },
      {
        "ol": [
          "Приемане на отчет и остойностяване на положения личен труд за месец {{introText}}.",
          "Вземане на решение за изплащане на възнаграждение за положения личен труд."
        ],
        "margin": [0, 0, 0, 15]
      },
      {
        "text": "Взети решения",
        "style": "sectionHeader",
        "margin": [0, 10, 0, 10]
      },
      {
        "text": "По т. 1: Събранието констатира, че свършената с изрърша следната дейности:",
        "margin": [0, 0, 0, 15],
        "bold": false
      },
      "{{activitiesTable}}",
      {
        "columns": [
          { "text": "Общо", "width": "*", "alignment": "right", "bold": true, "fontSize": 11 },
          { "text": "", "width": 80 },
          { "text": "{{totalAmount}}", "width": 100, "alignment": "right", "bold": true, "fontSize": 11 }
        ],
        "margin": [0, 10, 0, 20]
      },
      {
        "text": [
          "Общата сума за месец ",
          { "text": "{{introText}}", "bold": false },
          " възлиза на ",
          { "text": "{{totalAmount}}", "bold": true },
          "."
        ],
        "margin": [0, 0, 0, 20],
        "alignment": "justify"
      },
      {
        "text": [
          "По т. 2: Събранието реши възнаграждението за месец ",
          { "text": "{{introText}}", "bold": false },
          " в размер на ",
          { "text": "{{totalAmount}}", "bold": true },
          " да бъде изплатено по банков път."
        ],
        "margin": [0, 0, 0, 30],
        "alignment": "justify"
      },
      {
        "text": "СЪДЪРЖНИК:",
        "bold": true,
        "margin": [0, 20, 0, 5]
      },
      {
        "text": "{{workerName}}",
        "margin": [0, 0, 0, 2]
      },
      {
        "text": [
          { "text": "{{reportDate}}", "bold": false },
          " г., гр. ",
          { "text": "{{city}}", "bold": false }
        ],
        "margin": [0, 0, 0, 0]
      }
    ]
  }',
  '{
    "title": {
      "fontSize": 18,
      "bold": true,
      "color": "#000000"
    },
    "sectionHeader": {
      "fontSize": 12,
      "bold": true,
      "color": "#000000",
      "decoration": "underline"
    }
  }'
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  template_definition = EXCLUDED.template_definition,
  styles = EXCLUDED.styles;
