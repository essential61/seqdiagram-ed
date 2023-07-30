<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns="http://www.w3.org/2000/svg">

  <xsl:variable name="HSPACING" select="160"/>
  <xsl:variable name="VSPACING" select="120"/>
  <xsl:variable name="SVGWIDTH" select="$HSPACING * (2 + count(/sequencediagml/objectlist/object))"/>

  <xsl:template match="/">
    <xsl:element name="svg">
      <xsl:attribute name="width"><xsl:value-of select="$SVGWIDTH"/></xsl:attribute>
      <xsl:attribute name="height">600</xsl:attribute>
      <xsl:attribute name="viewBox"><xsl:value-of select="concat('0', ' -120 ', $SVGWIDTH, ' 600')"/></xsl:attribute>
    <defs>
      <marker id="arrowhead-solid" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" />
      </marker>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <line x1="0" y1="0" x2="10" y2="3.5" style="stroke:black;"/>
        <line x1="0" y1="7" x2="10" y2="3.5" style="stroke:black;"/>
      </marker>
      <symbol id="object-rect" style="stroke: black; fill: none; stroke-width: 2;">
        <rect x="110" y="10" width="100" height="60"/>
      </symbol>
      <g id="actor" style="stroke: black; fill: none; stroke-width: 2;">
        <circle cx="160" cy="25" r="10" style="fill:none;stroke:black;stroke-width:2;"/>
        <line x1="160" y1="35" x2="160" y2="60" style="stroke:black;stroke-width:2;"/>
        <line x1="145" y1="40" x2="175" y2="40" style="stroke:black;stroke-width:2;"/>
        <line x1="160" y1="60" x2="145" y2="80" style="stroke:black;stroke-width:2;"/>
        <line x1="160" y1="60" x2="175" y2="80" style="stroke:black;stroke-width:2;"/>
      </g>
    </defs>
      <!-- test -->
      <line x1="0" y1="0" x2="250" y2="0" style="stroke:black;stroke-width:2;"/>
      <line x1="0" y1="50" x2="250" y2="50" style="stroke:black;stroke-width:2;" marker-end="url(#arrowhead-solid)"/>
      <line x1="0" y1="150" x2="250" y2="150" style="stroke:black;stroke-width:2;" marker-end="url(#arrowhead)"/>
      <!-- test end -->
      <xsl:apply-templates select="/sequencediagml/objectlist/object"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="object">
    <xsl:variable name="HPOS" select="(count(preceding-sibling::object) + 1) * $HSPACING"/>
    <xsl:element name="use">
      <xsl:choose>
        <xsl:when test="@type = 'actor'">
           <xsl:attribute name="href">#actor</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="href">#object-rect</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:attribute name="x"><xsl:value-of select="$HPOS - $HSPACING"/></xsl:attribute>
      <xsl:attribute name="y">-100</xsl:attribute>
    </xsl:element>
    <xsl:element name="line">
      <xsl:attribute name="x1"><xsl:value-of select="$HPOS"/></xsl:attribute>
      <xsl:attribute name="y1">0</xsl:attribute>
      <xsl:attribute name="x2"><xsl:value-of select="$HPOS"/></xsl:attribute>
      <xsl:attribute name="y2"><xsl:value-of select="/sequencediagml/parameters/max_t * $VSPACING"/></xsl:attribute>
      <xsl:attribute name="style">stroke: black; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
