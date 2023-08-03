<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns="http://www.w3.org/2000/svg">

  <!-- space between objects -->
  <xsl:variable name="HSPACING" select="160"/>
  <!-- space between increments of t -->
  <xsl:variable name="VSPACING" select="20"/>
  <xsl:variable name="SVGWIDTH" select="$HSPACING * (2 + count(/sequencediagml/objectlist/object))"/>
  <xsl:variable name="VOFFSET" select="-120"/>
  <xsl:variable name="SVGHEIGHT" select="($VSPACING * (/sequencediagml/parameters/max_t/text() + 1)) - $VOFFSET"/>
  <xsl:variable name="ACTIVITYBARWIDTH" select="20"/>

  <xsl:template match="/">
    <xsl:element name="svg">
      <xsl:attribute name="width"><xsl:value-of select="$SVGWIDTH"/></xsl:attribute>

      <xsl:attribute name="height"><xsl:value-of select="$SVGHEIGHT"/></xsl:attribute>
      <xsl:attribute name="viewBox"><xsl:value-of select="concat('0 ', $VOFFSET, ' ', $SVGWIDTH, ' ', $SVGHEIGHT)"/></xsl:attribute>
    <defs>
      <marker id="arrowhead-solid" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" />
      </marker>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <line x1="0" y1="0" x2="10" y2="3.5" style="stroke:black;"/>
        <line x1="0" y1="7" x2="10" y2="3.5" style="stroke:black;"/>
      </marker>
      <symbol id="object-rect" style="stroke: black; fill: none; stroke-width: 2;">
        <rect x="90" y="10" width="140" height="60"/>
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
    <xsl:choose>
      <xsl:when test="@type = 'actor'">
          <xsl:element name="use">
           <xsl:attribute name="href">#actor</xsl:attribute>
           <xsl:attribute name="x"><xsl:value-of select="$HPOS - $HSPACING"/></xsl:attribute>
           <xsl:attribute name="y">-100</xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y">0</xsl:attribute>
            <xsl:attribute name="style">text-anchor: middle</xsl:attribute>
            <xsl:value-of select="objectname/text()"/>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y1">0</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="/sequencediagml/parameters/max_t * $VSPACING"/></xsl:attribute>
            <xsl:attribute name="style">stroke: black; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
          </xsl:element>
      </xsl:when>
      <xsl:otherwise>
          <xsl:element name="use">
           <xsl:attribute name="href">#object-rect</xsl:attribute>
           <xsl:attribute name="x"><xsl:value-of select="$HPOS - $HSPACING"/></xsl:attribute>
           <xsl:attribute name="y">-100</xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y">-50</xsl:attribute>
            <xsl:attribute name="style">text-anchor: middle</xsl:attribute>
            <xsl:value-of select="objectname/text()"/>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y1">-20</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HPOS"/></xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="/sequencediagml/parameters/max_t * $VSPACING"/></xsl:attribute>
            <xsl:attribute name="style">stroke: black; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
          </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
    <!-- draw activity bars -->
    <xsl:for-each select="activitybars/activitybar">
      <xsl:element name="rect">
        <xsl:attribute name="x"><xsl:value-of select="$HPOS - ($ACTIVITYBARWIDTH div 2)"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="$VSPACING * @begin_t"/></xsl:attribute>
        <xsl:attribute name="width"><xsl:value-of select="$ACTIVITYBARWIDTH"/></xsl:attribute>
        <xsl:attribute name="height"><xsl:value-of select="$VSPACING * (@end_t - @begin_t)"/></xsl:attribute>
        <xsl:attribute name="style">stroke: black; fill: white; stroke-width: 2;</xsl:attribute>
      </xsl:element>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>
