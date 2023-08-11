<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns="http://www.w3.org/2000/svg">

  <!-- space between objects -->
  <xsl:variable name="HSPACING" select="220"/>
  <!-- space between increments of t -->
  <xsl:variable name="VSPACING" select="20"/>
  <xsl:variable name="SVGWIDTH" select="$HSPACING * (1 + count(/sequencediagml/objectlist/object))"/>
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
          <xsl:element name="rect">
            <xsl:attribute name="x"><xsl:value-of select="$HSPACING - 80"/></xsl:attribute>
            <xsl:attribute name="y">10</xsl:attribute>
            <xsl:attribute name="width">160</xsl:attribute>
            <xsl:attribute name="height">60</xsl:attribute>
          </xsl:element>
        </symbol>
        <xsl:element name="g">
          <xsl:attribute name="id">actor</xsl:attribute>
          <xsl:attribute name="style">stroke: black; fill: none; stroke-width: 2;</xsl:attribute>
          <xsl:element name="circle">
            <xsl:attribute name="cx"><xsl:value-of select="$HSPACING"/></xsl:attribute>
            <xsl:attribute name="cy">20</xsl:attribute>
            <xsl:attribute name="r">10</xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING"/></xsl:attribute>
            <xsl:attribute name="y1">30</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING"/></xsl:attribute>
            <xsl:attribute name="y2">55</xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING - 15"/></xsl:attribute>
            <xsl:attribute name="y1">35</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING + 15"/></xsl:attribute>
            <xsl:attribute name="y2">35</xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING"/></xsl:attribute>
            <xsl:attribute name="y1">55</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING - 15"/></xsl:attribute>
            <xsl:attribute name="y2">75</xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING"/></xsl:attribute>
            <xsl:attribute name="y1">55</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING + 15"/></xsl:attribute>
            <xsl:attribute name="y2">75</xsl:attribute>
          </xsl:element>
        </xsl:element>
        <filter x="0" y="0" width="1" height="1" id="textbg">
          <feFlood flood-color="white" result="bg" flood-opacity="0.4"/>
          <feMerge>
            <feMergeNode in="bg"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="dropshadow" x="0" y="0"  width="200%" height="200%">
          <feOffset result="offOut" in="SourceGraphic" dx="4" dy="4" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>
    <!--  <g filter="url(#dropshadow)">
       <circle r="5" cx="0" cy="0" visibility="hidden"></circle>
       <line x1="0" y1="0" x2="250" y2="0" style="stroke:black;stroke-width:2;" marker-end="url(#arrowhead-solid)" filter="url(#dropshadow)"/>
      </g>
      <line x1="0" y1="50" x2="250" y2="50" style="stroke:black;stroke-width:2;" marker-end="url(#arrowhead-solid)"/>
      <line x1="0" y1="150" x2="250" y2="150" style="stroke:black;stroke-width:2;" marker-end="url(#arrowhead)"/> -->
      <xsl:apply-templates select="/sequencediagml/objectlist/object"/>
      <xsl:apply-templates select="/sequencediagml/messagelist/message"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="object">
    <xsl:variable name="OBJECTIDX" select="count(preceding-sibling::object)"/>
    <xsl:variable name="HPOS" select="($OBJECTIDX + 1) * $HSPACING"/>
    <xsl:variable name="HREF">
      <xsl:choose>
        <xsl:when test="@type = 'actor'"><xsl:value-of select="'#actor'"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="'#object-rect'"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LIFELINESTART">
      <xsl:choose>
        <xsl:when test="@type = 'actor'"><xsl:value-of select="0"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="-20"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TEXTPOSITION">
      <xsl:choose>
        <xsl:when test="@type = 'actor'"><xsl:value-of select="-10"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="-70"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="g">
      <xsl:attribute name="id"><xsl:value-of select="concat('object_', $OBJECTIDX)"/></xsl:attribute>
      <xsl:attribute name="pointer-events">all</xsl:attribute>
      <xsl:element name="use">
        <xsl:attribute name="href"><xsl:value-of select="$HREF"/></xsl:attribute>
        <xsl:attribute name="x"><xsl:value-of select="$HPOS - $HSPACING"/></xsl:attribute>
        <xsl:attribute name="y">-100</xsl:attribute>
      </xsl:element>
      <xsl:element name="line">
        <xsl:attribute name="x1"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y1"><xsl:value-of select="$LIFELINESTART"/></xsl:attribute>
        <xsl:attribute name="x2"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y2"><xsl:value-of select="/sequencediagml/parameters/max_t * $VSPACING"/></xsl:attribute>
        <xsl:attribute name="style">stroke: black; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
      </xsl:element>
      <xsl:element name="text">
        <xsl:attribute name="x"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="$TEXTPOSITION"/></xsl:attribute>
        <xsl:attribute name="style">text-anchor: middle</xsl:attribute>
        <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
        <xsl:choose>
          <xsl:when test="contains(objectname/text(),'&#10;')">
            <xsl:value-of select="substring-before(objectname/text(), '&#10;')"/>
            <xsl:call-template name="tspan">
              <xsl:with-param name="XPOS" select="$HPOS"/>
              <xsl:with-param name="TEXT" select="substring-after(objectname/text(), '&#10;')"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="objectname/text()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
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
    </xsl:element>
  </xsl:template>

  <xsl:template match="message">
    <xsl:variable name="MESSAGEIDX" select="count(preceding-sibling::message)"/>
    <xsl:variable name="MESSAGEOFFSET">
      <xsl:choose>
        <xsl:when test="@to > @from">
          <xsl:value-of select="$ACTIVITYBARWIDTH div 2"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$ACTIVITYBARWIDTH div -2"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ARROWTYPE">
      <xsl:choose>
        <xsl:when test="@type = 'asynchronous'">
          <xsl:value-of select="'url(#arrowhead)'"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="'url(#arrowhead-solid)'"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="MESSAGEANCHOR"><xsl:value-of select="concat('text-anchor: ', substring('end', 1 div (contains($MESSAGEOFFSET, '-'))), substring('start', 1 div not(contains($MESSAGEOFFSET, '-'))))"/></xsl:variable>
    <xsl:variable name="RESPONSEANCHOR"><xsl:value-of select="concat('text-anchor: ', substring('start', 1 div (contains($MESSAGEOFFSET, '-'))), substring('end', 1 div not(contains($MESSAGEOFFSET, '-'))))"/></xsl:variable>
    <xsl:element name="g">
      <xsl:attribute name="id"><xsl:value-of select="concat('message_', $MESSAGEIDX)"/></xsl:attribute>
      <xsl:attribute name="pointer-events">all</xsl:attribute>
      <xsl:element name="line">
        <xsl:attribute name="x1"><xsl:value-of select="((@from + 1) * $HSPACING) + $MESSAGEOFFSET"/></xsl:attribute>
        <xsl:attribute name="y1"><xsl:value-of select="(@t * $VSPACING)"/></xsl:attribute>
        <xsl:attribute name="x2"><xsl:value-of select="((@to + 1) * $HSPACING) - $MESSAGEOFFSET"/></xsl:attribute>
        <xsl:attribute name="y2"><xsl:value-of select="@t * $VSPACING"/></xsl:attribute>
        <xsl:attribute name="style">stroke:black;stroke-width:2;</xsl:attribute>
        <xsl:attribute name="marker-end"><xsl:value-of select="$ARROWTYPE"/></xsl:attribute>
      </xsl:element>
      <xsl:element name="text">
        <xsl:attribute name="x"><xsl:value-of select="((@from + 1) * $HSPACING) + (2 * $MESSAGEOFFSET)"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="(@t * $VSPACING) - 6"/></xsl:attribute>
        <xsl:attribute name="style"><xsl:value-of select="$MESSAGEANCHOR"/></xsl:attribute>
        <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
        <xsl:choose>
          <xsl:when test="contains(messagetext/text(),'&#10;')">
            <xsl:value-of select="substring-before(messagetext/text(), '&#10;')"/>
            <xsl:call-template name="tspan">
              <xsl:with-param name="XPOS" select="((@from + 1) * $HSPACING) + (2 * $MESSAGEOFFSET)"/>
              <xsl:with-param name="TEXT" select="substring-after(messagetext/text(), '&#10;')"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="messagetext/text()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>

      <xsl:if test="count(response)">
        <xsl:element name="line">
          <xsl:attribute name="x1"><xsl:value-of select="((@to + 1) * $HSPACING) - $MESSAGEOFFSET"/></xsl:attribute>
          <xsl:attribute name="y1"><xsl:value-of select="response/@t * $VSPACING"/></xsl:attribute>
          <xsl:attribute name="x2"><xsl:value-of select="((@from + 1) * $HSPACING) + $MESSAGEOFFSET"/></xsl:attribute>
          <xsl:attribute name="y2"><xsl:value-of select="response/@t * $VSPACING"/></xsl:attribute>
          <xsl:attribute name="style">stroke: black; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
          <xsl:attribute name="marker-end"><xsl:value-of select="$ARROWTYPE"/></xsl:attribute>
        </xsl:element>
        <xsl:element name="text">
          <xsl:attribute name="x"><xsl:value-of select="((@to + 1) * $HSPACING) - (2 * $MESSAGEOFFSET)"/></xsl:attribute>
          <xsl:attribute name="y"><xsl:value-of select="(response/@t * $VSPACING) - 6"/></xsl:attribute>
          <xsl:attribute name="style"><xsl:value-of select="$RESPONSEANCHOR"/></xsl:attribute>
          <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
          <xsl:choose>
            <xsl:when test="contains(response/text(),'&#10;')">
              <xsl:value-of select="substring-before(response/text(), '&#10;')"/>
              <xsl:call-template name="tspan">
                <xsl:with-param name="XPOS" select="((@to + 1) * $HSPACING) - (2 * $MESSAGEOFFSET)"/>
                <xsl:with-param name="TEXT" select="substring-after(response/text(), '&#10;')"/>
              </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="response/text()"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:element>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <xsl:template name="tspan">
    <xsl:param name="XPOS"/>
    <xsl:param name="TEXT"/>
    <xsl:variable name="DY">20</xsl:variable>
    <xsl:element name="tspan">
      <xsl:attribute name="x"><xsl:value-of select="$XPOS"/></xsl:attribute>
      <xsl:attribute name="dy"><xsl:value-of select="$DY"/></xsl:attribute>
      <xsl:value-of select="concat( substring(substring-before($TEXT, '&#10;'), 1 div (contains($TEXT, '&#10;'))), substring($TEXT, 1 div not(contains($TEXT, '&#10;'))))"/>
    </xsl:element>
    <xsl:choose>
      <xsl:when test="contains($TEXT,'&#10;')">
        <xsl:call-template name="tspan">
          <xsl:with-param name="XPOS" select="$XPOS"/>
          <xsl:with-param name="TEXT" select="substring-after($TEXT, '&#10;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
