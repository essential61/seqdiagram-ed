const examples = {
  // Example1
  Example1: `<?xml version="1.0" encoding="UTF-8"?>
<sequencediagml>
    <parameters>
        <hspacing>240</hspacing>
        <vspacing>26</vspacing>
        <max_t>21</max_t>
        <fontsize>12</fontsize>
        <objectfill>#E1E1C8</objectfill>
        <activitybarfill>#C8C8FA</activitybarfill>
    </parameters>
    <lifelinelist>
        <lifeline type="actor">
            <lifelinename>random guy</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="20"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>an object</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="20"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>another object</lifelinename>
            <activitybars>
                <activitybar begin_t="12" end_t="13"/>
            </activitybars>
        </lifeline>
        <lifeline type="object" destroy_t="18">
            <lifelinename>an ephemeral object</lifelinename>
            <activitybars>
                <activitybar begin_t="8" end_t="12"/>
                <activitybar begin_t="16" end_t="17"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>yet another object</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="20"/>
            </activitybars>
        </lifeline>
    </lifelinelist>
    <messagelist>
        <message type="asynchronous" from="0" to="1" t="2">
            <messagetext>begin</messagetext>
        </message>
        <message type="create" from="1" to="3" t="3">
            <messagetext>create object</messagetext>
        </message>
        <message type="reflexive" from="1" t="7">
            <messagetext>reflexive message</messagetext>
        </message>
        <message type="synchronous" from="4" to="3" t="8">
            <messagetext>synchronous message</messagetext>
            <response t="12">response</response>
        </message>
        <message type="asynchronous" from="1" to="2" t="12">
            <messagetext>asynchronous message</messagetext>
        </message>
        <message type="asynchronous" from="1" to="3" t="16">
            <messagetext>destroy object</messagetext>
        </message>
    </messagelist>
    <framelist>
        <frame type="SD" widthfactor="1">
            <operand>Example Diagram</operand>
        </frame>
        <frame type="ALT" left="1" right="2" top="5" bottom="14">
            <operand t="5">[condition x]</operand>
            <operand t="10">[else]</operand>
        </frame>
    </framelist>
</sequencediagml>`,
  // An ATM example
  ATM: `<?xml version="1.0" encoding="UTF-8"?>
<sequencediagml>
    <parameters>
        <hspacing>250</hspacing>
        <vspacing>32</vspacing>
        <max_t>37</max_t>
        <fontsize>12</fontsize>
        <objectfill>#FFFFFF</objectfill>
        <activitybarfill>#FFFFFF</activitybarfill>
    </parameters>
    <lifelinelist>
        <lifeline type="actor">
            <lifelinename>Customer</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="36"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>ATM</lifelinename>
            <activitybars>
                <activitybar begin_t="2" end_t="5"/>
                <activitybar begin_t="7" end_t="10"/>
                <activitybar begin_t="12" end_t="14"/>
                <activitybar begin_t="16" end_t="33"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Bank Back-Office</lifelinename>
            <activitybars>
                <activitybar begin_t="3" end_t="4"/>
                <activitybar begin_t="17" end_t="30"/>
            </activitybars>
        </lifeline>
    </lifelinelist>
    <messagelist>
        <message type="synchronous" from="0" to="1" t="2">
            <messagetext>Insert Card</messagetext>
            <response t="5">Prompt for PIN</response>
        </message>
        <message type="synchronous" from="1" to="2" t="3">
            <messagetext>Validate Card</messagetext>
            <response t="4">Card OK</response>
        </message>
        <message type="synchronous" from="0" to="1" t="7">
            <messagetext>Enter PIN</messagetext>
            <response t="10">Display Options Menu</response>
        </message>
        <message type="reflexive" from="1" t="8">
            <messagetext>Validate PIN</messagetext>
        </message>
        <message type="synchronous" from="0" to="1" t="12">
            <messagetext>Request Cash Withdrawal</messagetext>
            <response t="14">Prompt for Amount</response>
        </message>
        <message type="synchronous" from="0" to="1" t="16">
            <messagetext>Enter Amount Selected</messagetext>
        </message>
        <message type="synchronous" from="1" to="2" t="17">
            <messagetext>Check Account Balance</messagetext>
        </message>
        <message type="synchronous" from="2" to="1" t="21">
            <messagetext>Sufficient Funds</messagetext>
        </message>
        <message type="synchronous" from="1" to="0" t="22">
            <messagetext>Dispense Cash</messagetext>
        </message>
        <message type="synchronous" from="0" to="1" t="24">
            <messagetext>Take Cash</messagetext>
        </message>
        <message type="synchronous" from="1" to="0" t="26">
            <messagetext>Return Card</messagetext>
        </message>
        <message type="synchronous" from="2" to="1" t="30">
            <messagetext>Insufficient Funds</messagetext>
        </message>
        <message type="synchronous" from="1" to="0" t="31">
            <messagetext>Display "Declined" Message</messagetext>
        </message>
        <message type="synchronous" from="1" to="0" t="33">
            <messagetext>Return Card</messagetext>
        </message>
    </messagelist>
    <framelist>
        <frame type="ALT" left="0" right="2" top="19" bottom="35">
            <operand t="19">[Transaction Approved]</operand>
            <operand t="28">[Transaction Declined]</operand>
        </frame>
        <frame type="SD" widthfactor="1">
            <operand t="">ATM Example</operand>
        </frame>
    </framelist>
</sequencediagml>`,
  // A Kerberos Authentication example
  Kerberos: `<?xml version="1.0" encoding="UTF-8"?>
<sequencediagml>
    <parameters>
        <hspacing>270</hspacing>
        <vspacing>20</vspacing>
        <max_t>27</max_t>
        <fontsize>12</fontsize>
        <objectfill>#e1e1e1</objectfill>
        <activitybarfill>#c8fac8</activitybarfill>
    </parameters>
    <lifelinelist>
        <lifeline type="object">
            <lifelinename>User</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="25"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Authentication Service</lifelinename>
            <activitybars>
                <activitybar begin_t="3" end_t="7"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Ticket Granting
Service (TGS)</lifelinename>
            <activitybars>
                <activitybar begin_t="10" end_t="14"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Kerberos Database</lifelinename>
            <activitybars>
                <activitybar begin_t="5" end_t="6"/>
                <activitybar begin_t="12" end_t="13"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Kerberos-protected
Services</lifelinename>
            <activitybars>
                <activitybar begin_t="18" end_t="25"/>
            </activitybars>
        </lifeline>
    </lifelinelist>
    <messagelist>
        <message type="synchronous" from="0" to="1" t="3">
            <messagetext>Authentication Request()</messagetext>
            <response t="7">Ticket Granting Ticket (TGT)</response>
        </message>
        <message type="synchronous" from="1" to="3" t="5">
            <messagetext>Check if user exists in DB</messagetext>
        </message>
        <message type="synchronous" from="0" to="2" t="10">
            <messagetext>Request for Service Granting Ticket (TGT, ID of Requested Service)</messagetext>
            <response t="14">Ticket Granting Service (TGS)</response>
        </message>
        <message type="synchronous" from="2" to="3" t="12">
            <messagetext>Check if user exists in DB</messagetext>
        </message>
        <message type="synchronous" from="0" to="4" t="18">
            <messagetext>Request for Services(TGS)</messagetext>
            <response t="22">Access granted to user</response>
        </message>
    </messagelist>
    <framelist>
        <frame type="SD" widthfactor="1">
            <operand t="">Kerberos Authentication</operand>
        </frame>
    </framelist>
</sequencediagml>`,
  // Kubernets POD creation
  Kubernetes: `<?xml version="1.0" encoding="UTF-8"?>
<sequencediagml>
    <parameters>
        <hspacing>200</hspacing>
        <vspacing>30</vspacing>
        <max_t>20</max_t>
        <fontsize>12</fontsize>
        <objectfill>#c8c8fa</objectfill>
        <activitybarfill>#c8fac8</activitybarfill>
    </parameters>
    <lifelinelist>
        <lifeline type="actor">
            <lifelinename>Kubectl User</lifelinename>
            <activitybars/>
        </lifeline>
        <lifeline type="object">
            <lifelinename>API Server
(master)</lifelinename>
            <activitybars>
                <activitybar begin_t="1" end_t="4"/>
                <activitybar begin_t="6" end_t="9"/>
                <activitybar begin_t="13" end_t="16"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Cluster Store - etcd
(master)</lifelinename>
            <activitybars>
                <activitybar begin_t="2" end_t="3"/>
                <activitybar begin_t="7" end_t="8"/>
                <activitybar begin_t="14" end_t="15"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Scheduler
(master)</lifelinename>
            <activitybars>
                <activitybar begin_t="5" end_t="9"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Kubelet
(worker)</lifelinename>
            <activitybars>
                <activitybar begin_t="10" end_t="16"/>
            </activitybars>
        </lifeline>
        <lifeline type="object">
            <lifelinename>Docker
(worker)</lifelinename>
            <activitybars>
                <activitybar begin_t="11" end_t="12"/>
            </activitybars>
        </lifeline>
    </lifelinelist>
    <messagelist>
        <message type="synchronous" from="0" to="1" t="1">
            <messagetext>Create Deployment</messagetext>
            <response t="4">OK</response>
        </message>
        <message type="synchronous" from="1" to="2" t="2">
            <messagetext>Write</messagetext>
            <response t="3">OK</response>
        </message>
        <message type="asynchronous" from="1" to="3" t="5">
            <messagetext>New Pod Desired</messagetext>
        </message>
        <message type="synchronous" from="3" to="1" t="6">
            <messagetext>Bind Pod</messagetext>
            <response t="9">OK</response>
        </message>
        <message type="synchronous" from="1" to="2" t="7">
            <messagetext>Write</messagetext>
            <response t="8">OK</response>
        </message>
        <message type="asynchronous" from="1" to="4" t="10">
            <messagetext>Create Bound Pod</messagetext>
        </message>
        <message type="synchronous" from="4" to="5" t="11">
            <messagetext>Docker Run</messagetext>
            <response t="12">OK</response>
        </message>
        <message type="synchronous" from="4" to="1" t="13">
            <messagetext>Update Pod Status</messagetext>
            <response t="16">OK</response>
        </message>
        <message type="synchronous" from="1" to="2" t="14">
            <messagetext>Write</messagetext>
            <response t="15">OK</response>
        </message>
    </messagelist>
    <framelist/>
</sequencediagml>`
};
