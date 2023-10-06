<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <xsl:param  name="SHOWSCALE" select="''"/>
  <xsl:param  name="SCALEFACTOR" select="1"/>
  <!-- invisible bounding rects to make it easier to click on lines -->
  <xsl:param  name="BOUNDINGRECTS" select="'yes'"/>
  <!-- space between lifelines -->
  <xsl:variable name="HSPACING" select="/sequencediagml/parameters/hspacing/text()"/>
  <!-- space between increments of t -->
  <xsl:variable name="VSPACING" select="/sequencediagml/parameters/vspacing/text()"/>
  <xsl:variable name="SUMSPACINGFACTOR">
      <xsl:call-template name="sumspacingfactor">
        <xsl:with-param name="N"><xsl:value-of select="count(/sequencediagml/lifelinelist/lifeline)"/></xsl:with-param>
        <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
      </xsl:call-template>
  </xsl:variable>
  <xsl:variable name="SVGWIDTH">
    <xsl:choose>
      <xsl:when test="count(/sequencediagml/lifelinelist/lifeline) > 1">
        <xsl:value-of select="$HSPACING * ($SUMSPACINGFACTOR + 1)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$HSPACING * 2"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="VOFFSET" select="-160"/>
  <xsl:variable name="MAXT" select="/sequencediagml/parameters/max_t/text()"/>
  <xsl:variable name="SVGHEIGHT" select="($VSPACING * ($MAXT + 1)) - $VOFFSET"/>
  <xsl:variable name="ACTIVITYBARWIDTH" select="20"/>
  <xsl:variable name="FONTSIZE" select="/sequencediagml/parameters/fontsize/text()"/>
  <xsl:variable name="FONTSTRING" select="concat('font-size: ', $FONTSIZE, 'pt; font-family: Arial, Helvetica, sans-serif;')"/>
  <xsl:template match="/">
    <xsl:element name="svg">
      <xsl:attribute name="width"><xsl:value-of select="$SVGWIDTH * $SCALEFACTOR"/></xsl:attribute>
      <xsl:attribute name="height"><xsl:value-of select="$SVGHEIGHT * $SCALEFACTOR"/></xsl:attribute>
      <xsl:attribute name="viewBox"><xsl:value-of select="concat(-$HSPACING div 2, ' ', $VOFFSET, ' ', $SVGWIDTH, ' ', $SVGHEIGHT)"/></xsl:attribute>
      <defs>
        <marker id="arrowhead-solid" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
        <marker id="arrowhead" markerWidth="10" style="stroke: black; stroke-width: 1;" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <line x1="0" y1="0" x2="10" y2="3.5"/>
          <line x1="0" y1="7" x2="10" y2="3.5"/>
        </marker>
        <symbol id="object-rect" style="fill: none;" viewBox="-200 0 400 100">
          <xsl:element name="rect">
            <xsl:attribute name="x"><xsl:value-of select="$HSPACING * -0.4"/></xsl:attribute>
            <xsl:attribute name="y">5</xsl:attribute>
            <xsl:attribute name="width"><xsl:value-of select="$HSPACING * 0.8"/></xsl:attribute>
            <xsl:attribute name="height">90</xsl:attribute>
          </xsl:element>
        </symbol>
        <symbol id="active-object-rect" style="fill: none;" viewBox="-200 0 400 100">
          <use href="#object-rect" xlink:href="#object-rect" width="400" height="100" x="-200" y="0"/>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="($HSPACING * -0.4) + 10"/></xsl:attribute>
            <xsl:attribute name="y1">5</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="($HSPACING * -0.4) + 10"/></xsl:attribute>
            <xsl:attribute name="y2">95</xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="($HSPACING * 0.4) - 10"/></xsl:attribute>
            <xsl:attribute name="y1">5</xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="($HSPACING * 0.4) - 10"/></xsl:attribute>
            <xsl:attribute name="y2">95</xsl:attribute>
          </xsl:element>
        </symbol>
        <symbol id="frame-polygon" style="fill: white;">
          <polygon points="0,0 80,0 80,15 70,30 0,30"/>
        </symbol>
        <symbol id="actor" style="fill: none;" viewBox="-200 0 400 100">
          <circle cx="0" cy="20" r="10"/>
          <line x1="0" y1="30" x2="0" y2="55"/>
          <line x1="-15" y1="35" x2="15" y2="35"/>
          <line x1="0" y1="55" x2="-15" y2="75"/>
          <line x1="0" y1="55" x2="15" y2="75"/>
        </symbol>
        <symbol id="boundary" style="fill: none;" viewBox="-200 0 400 100">
          <circle cx="0" cy="40" r="35"/>
          <line x1="-35" y1="40" x2="-60" y2="40"/>
          <line x1="-60" y1="5" x2="-60" y2="75"/>
        </symbol>
        <symbol id="entity" style="fill: none;" viewBox="-200 0 400 100">
          <circle cx="0" cy="40" r="35"/>
          <line x1="-35" y1="75" x2="35" y2="75"/>
        </symbol>
        <symbol id="control" style="fill: none;" viewBox="-200 0 400 100">
          <circle cx="0" cy="40" r="35"/>
          <line x1="0" y1="5" x2="5" y2="0"/>
          <line x1="0" y1="5" x2="5" y2="10"/>
        </symbol>
        <symbol id="reflexive" style="fill: none;">
          <xsl:element name="line">
            <xsl:attribute name="x1">0</xsl:attribute>
            <xsl:attribute name="y1"><xsl:value-of select="$VSPACING"/></xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING div 5"/></xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="$VSPACING"/></xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING div 5"/></xsl:attribute>
            <xsl:attribute name="y1"><xsl:value-of select="$VSPACING"/></xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="$HSPACING div 5"/></xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="$VSPACING * 2"/></xsl:attribute>
          </xsl:element>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="$HSPACING div 5"/></xsl:attribute>
            <xsl:attribute name="y1"><xsl:value-of select="$VSPACING * 2"/></xsl:attribute>
            <xsl:attribute name="x2">0</xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="$VSPACING * 2"/></xsl:attribute>
            <xsl:attribute name="marker-end">url(#arrowhead-solid)</xsl:attribute>
          </xsl:element>
          <xsl:element name="rect">
            <xsl:attribute name="x">0</xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="$VSPACING"/></xsl:attribute>
            <xsl:attribute name="width"><xsl:value-of select="$HSPACING div 5"/></xsl:attribute>
            <xsl:attribute name="height"><xsl:value-of select="$VSPACING"/></xsl:attribute>
            <xsl:attribute name="visibility">hidden</xsl:attribute>
          </xsl:element>
        </symbol>
        <symbol id="destroy-symbol" style="fill: none; stroke-width: 4;" viewBox="-10 -10 20 20">
          <line x1="-10" y1="-10" x2="10" y2="10"/>
          <line x1="10" y1="-10" x2="-10" y2="10"/>
        </symbol>
        <filter x="0" y="0" width="1" height="1" id="textbg">
          <feFlood flood-color="white" result="bg" flood-opacity="0.6"/>
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

      <xsl:apply-templates select="/sequencediagml/lifelinelist/lifeline"/>
      <xsl:apply-templates select="/sequencediagml/messagelist/message"/>
      <xsl:apply-templates select="/sequencediagml/framelist/frame"/>
      <xsl:if test="$SHOWSCALE">
        <xsl:element name="line">
          <xsl:attribute name="x1"><xsl:value-of select="10 - ($HSPACING div 2)"/></xsl:attribute>
          <xsl:attribute name="y1">0</xsl:attribute>
          <xsl:attribute name="x2"><xsl:value-of select="10 - ($HSPACING div 2)"/></xsl:attribute>
          <xsl:attribute name="y2"><xsl:value-of select="$MAXT * $VSPACING"/></xsl:attribute>
          <xsl:attribute name="style">stroke: grey; stroke-width: 2;</xsl:attribute>
        </xsl:element>
        <xsl:call-template name="tick">
          <xsl:with-param name="I"><xsl:value-of select="$MAXT"/></xsl:with-param>
        </xsl:call-template>
      </xsl:if>
      <xsl:call-template name="sumspacingfactor">
        <xsl:with-param name="N">3</xsl:with-param>
        <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
      </xsl:call-template>
    </xsl:element>
  </xsl:template>

  <xsl:template match="lifeline">
    <xsl:variable name="LIFELINEIDX" select="count(preceding-sibling::lifeline)"/>
    <xsl:variable name="NSPACINGFACTOR">
      <xsl:call-template name="sumspacingfactor">
        <xsl:with-param name="N"><xsl:value-of select="$LIFELINEIDX + 1"/></xsl:with-param>
        <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="HPOS" select="$NSPACINGFACTOR * $HSPACING"/>
    <xsl:variable name="HREF">
      <xsl:choose>
        <xsl:when test="@type = 'actor'"><xsl:value-of select="'#actor'"/></xsl:when>
        <xsl:when test="@type = 'object'"><xsl:value-of select="'#object-rect'"/></xsl:when>
        <xsl:when test="@type = 'active-object'"><xsl:value-of select="'#active-object-rect'"/></xsl:when>
        <xsl:when test="@type = 'boundary'"><xsl:value-of select="'#boundary'"/></xsl:when>
        <xsl:when test="@type = 'entity'"><xsl:value-of select="'#entity'"/></xsl:when>
        <xsl:when test="@type = 'control'"><xsl:value-of select="'#control'"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="'#object-rect'"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CREATIONTIME">
      <xsl:choose>
        <xsl:when test="count(/sequencediagml/messagelist/message[@to = $LIFELINEIDX and @type = 'create'])"><xsl:value-of select="/sequencediagml/messagelist/message[@to = $LIFELINEIDX][1]/@t"/></xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="OBJECTY">
      <xsl:choose>
        <xsl:when test="$CREATIONTIME > 0"><xsl:value-of select="($CREATIONTIME * $VSPACING) - 50"/></xsl:when>
        <xsl:otherwise>-100</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TEXTPOSITION">
      <xsl:choose>
        <xsl:when test="(@type = 'actor' or @type = 'boundary' or @type = 'entity' or @type = 'control') and ($CREATIONTIME = 0)"><xsl:value-of select="-5"/></xsl:when>
        <xsl:when test="(@type = 'object' or @type = 'active-object') and ($CREATIONTIME = 0)"><xsl:value-of select="-70"/></xsl:when>
        <xsl:when test="(@type = 'actor' or @type = 'boundary' or @type = 'entity' or @type = 'control') and ($CREATIONTIME > 0)"><xsl:value-of select="($CREATIONTIME * $VSPACING) + 45"/></xsl:when>
        <xsl:when test="(@type = 'object' or @type = 'active-object') and ($CREATIONTIME > 0)"><xsl:value-of select="($CREATIONTIME * $VSPACING)-20"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="-70"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LIFELINESTART">
      <xsl:choose>
        <xsl:when test="$CREATIONTIME > 0"><xsl:value-of select="($CREATIONTIME * $VSPACING) + 50"/></xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LIFELINEEND">
      <xsl:choose>
        <xsl:when test="@destroy_t &lt; $MAXT"><xsl:value-of select="@destroy_t * $VSPACING"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$MAXT * $VSPACING"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="g">
      <xsl:attribute name="id"><xsl:value-of select="concat('lifeline_', $LIFELINEIDX)"/></xsl:attribute>
      <xsl:attribute name="pointer-events">all</xsl:attribute>
      <xsl:attribute name="style"><xsl:value-of select="$FONTSTRING"/></xsl:attribute>
      <xsl:attribute name="stroke">black</xsl:attribute>
      <xsl:attribute name="stroke-width">2</xsl:attribute>
      <xsl:element name="use">
        <xsl:attribute name="href"><xsl:value-of select="$HREF"/></xsl:attribute>
        <xsl:attribute name="xlink:href"><xsl:value-of select="$HREF"/></xsl:attribute>
        <xsl:attribute name="x"><xsl:value-of select="$HPOS - 200"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="$OBJECTY"/></xsl:attribute>
        <xsl:attribute name="width">400</xsl:attribute>
        <xsl:attribute name="height">100</xsl:attribute>
      </xsl:element>
      <xsl:element name="line">
        <xsl:attribute name="x1"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y1"><xsl:value-of select="$LIFELINESTART"/></xsl:attribute>
        <xsl:attribute name="x2"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y2"><xsl:value-of select="$LIFELINEEND"/></xsl:attribute>
        <xsl:attribute name="style">stroke-dasharray: 5 5;</xsl:attribute>
      </xsl:element>
      <xsl:element name="text">
        <xsl:attribute name="x"><xsl:value-of select="$HPOS"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="$TEXTPOSITION"/></xsl:attribute>
        <xsl:attribute name="style">text-anchor: middle; stroke-width: 1;</xsl:attribute>
        <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
        <xsl:choose>
          <xsl:when test="contains(lifelinename/text(),'&#10;')">
            <xsl:value-of select="substring-before(lifelinename/text(), '&#10;')"/>
            <xsl:call-template name="tspan">
              <xsl:with-param name="XPOS" select="$HPOS"/>
              <xsl:with-param name="TEXT" select="substring-after(lifelinename/text(), '&#10;')"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="lifelinename/text()"/>
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
          <xsl:attribute name="style">fill: white;</xsl:attribute>
        </xsl:element>
      </xsl:for-each>
      <xsl:if test="@destroy_t &lt; $MAXT">
        <xsl:element name="use">
          <xsl:attribute name="href">#destroy-symbol</xsl:attribute>
          <xsl:attribute name="xlink:href">#destroy-symbol</xsl:attribute>
          <xsl:attribute name="x"><xsl:value-of select="$HPOS - 10"/></xsl:attribute>
          <xsl:attribute name="y"><xsl:value-of select="$LIFELINEEND - 10"/></xsl:attribute>
          <xsl:attribute name="width">20</xsl:attribute>
          <xsl:attribute name="height">20</xsl:attribute>
        </xsl:element>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <xsl:template match="message">
    <xsl:variable name="MESSAGEIDX" select="count(preceding-sibling::message)"/>
    <xsl:variable name="FROMXFACTOR">
      <xsl:call-template name="sumspacingfactor">
        <xsl:with-param name="N"><xsl:value-of select="@from + 1"/></xsl:with-param>
        <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="TOXFACTOR">
      <xsl:call-template name="sumspacingfactor">
        <xsl:with-param name="N"><xsl:value-of select="@to + 1"/></xsl:with-param>
        <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
      </xsl:call-template>
    </xsl:variable>
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
    <xsl:variable name="MESSAGEOFFSETTO">
      <xsl:choose>
        <xsl:when test="@type = 'create'">
          <xsl:value-of select="($MESSAGEOFFSET div ($ACTIVITYBARWIDTH div 2)) * (0.4 * $HSPACING)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$MESSAGEOFFSET"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="XBOUNDRECT">
      <xsl:choose>
        <xsl:when test="@to > @from">
          <xsl:value-of select="($FROMXFACTOR  * $HSPACING) + $MESSAGEOFFSET"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="($TOXFACTOR * $HSPACING) - $MESSAGEOFFSET"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ABSMESSAGEOFFSETS" select="($MESSAGEOFFSET + $MESSAGEOFFSETTO)*($MESSAGEOFFSET + $MESSAGEOFFSETTO >= 0) - ($MESSAGEOFFSET + $MESSAGEOFFSETTO)*($MESSAGEOFFSET + $MESSAGEOFFSETTO &lt; 0)"/>
    <xsl:variable name="WIDTHBOUNDRECT" select="((($FROMXFACTOR - $TOXFACTOR)*(($FROMXFACTOR - $TOXFACTOR) >=0) - ($FROMXFACTOR - $TOXFACTOR)*(($FROMXFACTOR - $TOXFACTOR) &lt; 0)) * $HSPACING) - $ABSMESSAGEOFFSETS"/>
    <xsl:variable name="ARROWTYPE">
      <xsl:choose>
        <xsl:when test="@type = 'asynchronous' or @type = 'create'">
          <xsl:value-of select="'url(#arrowhead)'"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="'url(#arrowhead-solid)'"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="MESSAGEANCHOR"><xsl:value-of select="concat('text-anchor: ', substring('end;', 1 div (contains($MESSAGEOFFSET, '-'))), substring('start;', 1 div not(contains($MESSAGEOFFSET, '-'))))"/></xsl:variable>
    <xsl:variable name="RESPONSEANCHOR"><xsl:value-of select="concat('text-anchor: ', substring('start;', 1 div (contains($MESSAGEOFFSET, '-'))), substring('end;', 1 div not(contains($MESSAGEOFFSET, '-'))))"/></xsl:variable>
    <xsl:element name="g">
      <xsl:attribute name="id"><xsl:value-of select="concat('message_', $MESSAGEIDX)"/></xsl:attribute>
      <xsl:attribute name="pointer-events">all</xsl:attribute>
      <xsl:attribute name="style"><xsl:value-of select="$FONTSTRING"/></xsl:attribute>
      <xsl:attribute name="stroke">black</xsl:attribute>
      <xsl:attribute name="stroke-width">2</xsl:attribute>
      <xsl:choose>
        <xsl:when test="@type = 'reflexive'">
          <xsl:element name="use">
            <xsl:attribute name="href">#reflexive</xsl:attribute>
            <xsl:attribute name="xlink:href">#reflexive</xsl:attribute>
            <xsl:attribute name="x"><xsl:value-of select="($FROMXFACTOR * $HSPACING) + ($ACTIVITYBARWIDTH div 2)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="((@t - 1) * $VSPACING)"/></xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="($FROMXFACTOR * $HSPACING) + $ACTIVITYBARWIDTH"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="(@t * $VSPACING) - 6"/></xsl:attribute>
            <xsl:attribute name="style">text-anchor: start; stroke-width: 1;</xsl:attribute>
            <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
            <xsl:choose>
              <xsl:when test="contains(messagetext/text(),'&#10;')">
                <xsl:value-of select="substring-before(messagetext/text(), '&#10;')"/>
                <xsl:call-template name="tspan">
                <xsl:with-param name="XPOS" select="($FROMXFACTOR * $HSPACING) + (2 * $MESSAGEOFFSET)"/>
                  <xsl:with-param name="TEXT" select="substring-after(messagetext/text(), '&#10;')"/>
                </xsl:call-template>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="messagetext/text()"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:element>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="line">
            <xsl:attribute name="x1"><xsl:value-of select="($FROMXFACTOR * $HSPACING) + $MESSAGEOFFSET"/></xsl:attribute>
            <xsl:attribute name="y1"><xsl:value-of select="(@t * $VSPACING)"/></xsl:attribute>
            <xsl:attribute name="x2"><xsl:value-of select="($TOXFACTOR * $HSPACING) - $MESSAGEOFFSETTO"/></xsl:attribute>
            <xsl:attribute name="y2"><xsl:value-of select="@t * $VSPACING"/></xsl:attribute>
            <xsl:if test="@type = 'create'">
              <xsl:attribute name="style">stroke-dasharray: 5 5;</xsl:attribute>
            </xsl:if>
            <xsl:attribute name="marker-end"><xsl:value-of select="$ARROWTYPE"/></xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="($FROMXFACTOR * $HSPACING) + (2 * $MESSAGEOFFSET)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="(@t * $VSPACING) - 6"/></xsl:attribute>
            <xsl:attribute name="style"><xsl:value-of select="$MESSAGEANCHOR"/> stroke-width: 1;</xsl:attribute>
            <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
            <xsl:choose>
              <xsl:when test="contains(messagetext/text(),'&#10;')">
                <xsl:value-of select="substring-before(messagetext/text(), '&#10;')"/>
                <xsl:call-template name="tspan">
                <xsl:with-param name="XPOS" select="($FROMXFACTOR * $HSPACING) + (2 * $MESSAGEOFFSET)"/>
                  <xsl:with-param name="TEXT" select="substring-after(messagetext/text(), '&#10;')"/>
                </xsl:call-template>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="messagetext/text()"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:element>
          <xsl:if test="$BOUNDINGRECTS = 'yes'">
            <xsl:element name="rect">
              <xsl:attribute name="x"><xsl:value-of select="$XBOUNDRECT"/></xsl:attribute>
              <xsl:attribute name="y"><xsl:value-of select="(@t * $VSPACING) - 3.5"/></xsl:attribute>
              <xsl:attribute name="width"><xsl:value-of select="$WIDTHBOUNDRECT"/></xsl:attribute>
              <xsl:attribute name="height">7</xsl:attribute>
              <xsl:attribute name="visibility">hidden</xsl:attribute>
            </xsl:element>
          </xsl:if>

          <xsl:if test="count(response)">
            <xsl:element name="line">
              <xsl:attribute name="x1"><xsl:value-of select="($TOXFACTOR * $HSPACING) - $MESSAGEOFFSET"/></xsl:attribute>
              <xsl:attribute name="y1"><xsl:value-of select="response/@t * $VSPACING"/></xsl:attribute>
              <xsl:attribute name="x2"><xsl:value-of select="($FROMXFACTOR * $HSPACING) + $MESSAGEOFFSET"/></xsl:attribute>
              <xsl:attribute name="y2"><xsl:value-of select="response/@t * $VSPACING"/></xsl:attribute>
              <xsl:attribute name="style">stroke-dasharray: 5 5;</xsl:attribute>
              <xsl:attribute name="marker-end"><xsl:value-of select="$ARROWTYPE"/></xsl:attribute>
            </xsl:element>
            <xsl:element name="text">
              <xsl:attribute name="x"><xsl:value-of select="($TOXFACTOR * $HSPACING) - (2 * $MESSAGEOFFSET)"/></xsl:attribute>
              <xsl:attribute name="y"><xsl:value-of select="(response/@t * $VSPACING) - 6"/></xsl:attribute>
              <xsl:attribute name="style"><xsl:value-of select="$RESPONSEANCHOR"/> stroke-width: 1;</xsl:attribute>
              <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
              <xsl:choose>
                <xsl:when test="contains(response/text(),'&#10;')">
                  <xsl:value-of select="substring-before(response/text(), '&#10;')"/>
                  <xsl:call-template name="tspan">
                    <xsl:with-param name="XPOS" select="($TOXFACTOR * $HSPACING) - (2 * $MESSAGEOFFSET)"/>
                    <xsl:with-param name="TEXT" select="substring-after(response/text(), '&#10;')"/>
                  </xsl:call-template>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="response/text()"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:element>
            <xsl:if test="$BOUNDINGRECTS = 'yes'">
              <xsl:element name="rect">
                <xsl:attribute name="x"><xsl:value-of select="$XBOUNDRECT"/></xsl:attribute>
                <xsl:attribute name="y"><xsl:value-of select="(response/@t * $VSPACING) - 3.5"/></xsl:attribute>
                <xsl:attribute name="width"><xsl:value-of select="$WIDTHBOUNDRECT"/></xsl:attribute>
                <xsl:attribute name="height">7</xsl:attribute>
                <xsl:attribute name="visibility">hidden</xsl:attribute>
              </xsl:element>
            </xsl:if>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <xsl:template match="frame">
    <xsl:variable name="FRAMEIDX" select="count(preceding-sibling::frame)"/>
    <xsl:element name="g">
      <xsl:attribute name="id"><xsl:value-of select="concat('frame_', $FRAMEIDX)"/></xsl:attribute>
      <xsl:attribute name="pointer-events">visiblePainted</xsl:attribute>
      <xsl:attribute name="style"><xsl:value-of select="$FONTSTRING"/></xsl:attribute>
      <xsl:attribute name="stroke">black</xsl:attribute>
      <xsl:attribute name="stroke-width">2</xsl:attribute>
      <xsl:choose>
        <xsl:when test="@type = 'SD'">
          <xsl:variable name="WIDTHFACTOR">
            <xsl:choose>
              <xsl:when test="count(@widthfactor)"><xsl:value-of select="@widthfactor"/></xsl:when>
              <xsl:otherwise>1</xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:element name="rect">
            <xsl:attribute name="x"><xsl:value-of select="1 - ($HSPACING div 2)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="$VOFFSET + 1"/></xsl:attribute>
            <xsl:attribute name="width"><xsl:value-of select="$SVGWIDTH - 2"/></xsl:attribute>
            <xsl:attribute name="height"><xsl:value-of select="$SVGHEIGHT - 2"/></xsl:attribute>
            <xsl:attribute name="style">fill: none;</xsl:attribute>
          </xsl:element>
          <xsl:element name="polygon">
            <xsl:attribute name="points"><xsl:value-of select="concat(1 - ($HSPACING div 2), ',', $VOFFSET + 1, ' ', ($WIDTHFACTOR - 0.5) * $HSPACING, ',', $VOFFSET + 1, ' ', ($WIDTHFACTOR - 0.5) * $HSPACING, ',', $VOFFSET + 21, ' ', (($WIDTHFACTOR - 0.5) * $HSPACING) - 20, ',', $VOFFSET + 41,' ', 1 - ($HSPACING div 2), ',', $VOFFSET + 41)"/></xsl:attribute>
            <xsl:attribute name="style">fill: white;</xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="10 - ($HSPACING div 2)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="$VOFFSET + 21"/></xsl:attribute>
            <xsl:attribute name="style">text-anchor: start; stroke-width: 1;</xsl:attribute>
            <xsl:attribute name="dominant-baseline">middle</xsl:attribute>
            <xsl:element name="tspan">
              <xsl:attribute name="style">font-weight: bold;</xsl:attribute>
              <xsl:value-of select="'SD&#160;'"/>
            </xsl:element>
            <xsl:value-of select="./operand[1]/text()"/>
          </xsl:element>
        </xsl:when>
        <xsl:otherwise>
          <xsl:variable name="FRAMEPADDING">
            <xsl:choose>
              <xsl:when test="@narrow = 'true'">0.15</xsl:when>
              <xsl:otherwise>0.25</xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="LEFTXFACTOR">
            <xsl:call-template name="sumspacingfactor">
              <xsl:with-param name="N"><xsl:value-of select="@left + 1"/></xsl:with-param>
              <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
            </xsl:call-template>
          </xsl:variable>
          <xsl:variable name="RIGHTXFACTOR">
            <xsl:call-template name="sumspacingfactor">
              <xsl:with-param name="N"><xsl:value-of select="@right + 1"/></xsl:with-param>
              <xsl:with-param name="RUNNINGTOTAL">0</xsl:with-param>
            </xsl:call-template>
          </xsl:variable>
          <xsl:variable name="OPTEXTX"><xsl:value-of select="($HSPACING  * ($LEFTXFACTOR - $FRAMEPADDING)) + 90"/></xsl:variable>
          <xsl:element name="rect">
            <xsl:attribute name="x"><xsl:value-of select="$HSPACING  * ($LEFTXFACTOR - $FRAMEPADDING)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="$VSPACING * @top"/></xsl:attribute>
            <xsl:attribute name="width"><xsl:value-of select="$HSPACING * ($RIGHTXFACTOR - $LEFTXFACTOR + (2 * $FRAMEPADDING))"/></xsl:attribute>
            <xsl:attribute name="height"><xsl:value-of select="$VSPACING * (@bottom - @top)"/></xsl:attribute>
            <xsl:attribute name="style">fill: none;</xsl:attribute>
          </xsl:element>
          <xsl:element name="use">
            <xsl:attribute name="href">#frame-polygon</xsl:attribute>
            <xsl:attribute name="xlink:href">#frame-polygon</xsl:attribute>
            <xsl:attribute name="x"><xsl:value-of select="$HSPACING  * ($LEFTXFACTOR - $FRAMEPADDING)"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="$VSPACING * @top"/></xsl:attribute>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="($HSPACING  * ($LEFTXFACTOR - $FRAMEPADDING)) + 10"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="($VSPACING * @top) + 5"/></xsl:attribute>
            <xsl:attribute name="style">text-anchor: start;</xsl:attribute>
            <xsl:attribute name="dominant-baseline">hanging</xsl:attribute>
            <xsl:value-of select="@type"/>
          </xsl:element>
          <xsl:element name="text">
            <xsl:attribute name="x"><xsl:value-of select="$OPTEXTX"/></xsl:attribute>
            <xsl:attribute name="y"><xsl:value-of select="($VSPACING * @top) + 15"/></xsl:attribute>
            <xsl:attribute name="style">text-anchor: start; stroke-width: 1;</xsl:attribute>
            <xsl:attribute name="dominant-baseline">middle</xsl:attribute>
            <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
            <xsl:value-of select="./operand[1]/text()"/>
          </xsl:element>
          <xsl:if test="@type = 'ALT' or @type = 'SEQ' or @type = 'PAR 'or @type = 'STRICT'">
            <xsl:apply-templates select="operand[count(preceding-sibling::operand) &gt; 0]">
               <xsl:with-param name="X1POS" select="$HSPACING  * ($LEFTXFACTOR - $FRAMEPADDING)"/>
               <xsl:with-param name="X2POS" select="$HSPACING  * ($RIGHTXFACTOR + $FRAMEPADDING)"/>
               <xsl:with-param name="TEXTX" select="$OPTEXTX"/>
            </xsl:apply-templates>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <xsl:template match="operand">
    <xsl:param name="X1POS"/>
    <xsl:param name="X2POS"/>
    <xsl:param name="TEXTX"/>
    <xsl:element name="line">
      <xsl:attribute name="x1"><xsl:value-of select="$X1POS"/></xsl:attribute>
      <xsl:attribute name="y1"><xsl:value-of select="@t * $VSPACING"/></xsl:attribute>
      <xsl:attribute name="x2"><xsl:value-of select="$X2POS"/></xsl:attribute>
      <xsl:attribute name="y2"><xsl:value-of select="@t * $VSPACING"/></xsl:attribute>
      <xsl:attribute name="style">fill: none; stroke-width: 2; stroke-dasharray: 5 5;</xsl:attribute>
    </xsl:element>
    <xsl:element name="text">
      <xsl:attribute name="x"><xsl:value-of select="$TEXTX"/></xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="($VSPACING * @t) + 5"/></xsl:attribute>
      <xsl:attribute name="style">text-anchor: start; stroke-width: 1;</xsl:attribute>
      <xsl:attribute name="dominant-baseline">hanging</xsl:attribute>
      <xsl:attribute name="filter">url(#textbg)</xsl:attribute>
      <xsl:value-of select="text()"/>
    </xsl:element>
  </xsl:template>

  <xsl:template name="tspan">
    <xsl:param name="XPOS"/>
    <xsl:param name="TEXT"/>
    <xsl:variable name="DY"><xsl:value-of select="$FONTSIZE * 2"/></xsl:variable>
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

  <xsl:template name="tick">
    <xsl:param name="I" />
    <xsl:element name="line">
      <xsl:attribute name="x1"><xsl:value-of select="10 - ($HSPACING div 2)"/></xsl:attribute>
      <xsl:attribute name="y1"><xsl:value-of select="$I * $VSPACING"/></xsl:attribute>
      <xsl:attribute name="x2"><xsl:value-of select="20 - ($HSPACING div 2)"/></xsl:attribute>
      <xsl:attribute name="y2"><xsl:value-of select="$I * $VSPACING"/></xsl:attribute>
      <xsl:attribute name="style">stroke: grey; stroke-width: 2;</xsl:attribute>
    </xsl:element>
    <xsl:if test="not($I mod 5)">
      <xsl:element name="text">
        <xsl:attribute name="dominant-baseline">middle</xsl:attribute>
        <xsl:attribute name="x"><xsl:value-of select="25 - ($HSPACING div 2)"/></xsl:attribute>
        <xsl:attribute name="y"><xsl:value-of select="$I * $VSPACING"/></xsl:attribute>
        <xsl:attribute name="style">text-anchor: start;</xsl:attribute>
        <xsl:value-of select="$I"/>
      </xsl:element>
    </xsl:if>
    <!--begin_: RepeatTheLoopUntilFinished-->
    <xsl:if test="0 &lt; $I">
      <xsl:call-template name="tick">
        <xsl:with-param name="I"><xsl:value-of select="$I - 1"/></xsl:with-param>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template name="sumspacingfactor">
    <xsl:param name="N"/>
    <xsl:param name="RUNNINGTOTAL"/>
    <xsl:variable name="SPACINGFACTOR">
      <xsl:choose>
        <xsl:when test="/sequencediagml/lifelinelist/lifeline[position() = $N]/@spacingfactor">
          <xsl:value-of select="/sequencediagml/lifelinelist/lifeline[position() = $N]/@spacingfactor"/>
        </xsl:when>
        <xsl:otherwise>1</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$N &gt; 2">
        <xsl:call-template name="sumspacingfactor">
          <xsl:with-param name="N"><xsl:value-of select="$N - 1"/></xsl:with-param>
          <xsl:with-param name="RUNNINGTOTAL"><xsl:value-of select="$RUNNINGTOTAL + $SPACINGFACTOR"/></xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$N = 2">
        <xsl:value-of select="$RUNNINGTOTAL + $SPACINGFACTOR"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="0"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
